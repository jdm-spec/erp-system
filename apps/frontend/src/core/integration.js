/**
 * Cross-Module Integration Orchestrator
 * Connects decoupled business flows strictly through typed event bus subscriptions
 * and data adapter transactions without direct cross-module coupling.
 */

import { events } from './events.js';
import { dataAdapter } from '../data/index.js';
import { toast } from '../components/toast.js';

export function initCrossModuleIntegration() {
  console.log('[Integration] Initializing cross-module business flow handlers...');

  // 1. Order-to-Cash (O2C): Sales Order Confirmed
  events.on('sales.order.confirmed', async ({ record }) => {
    toast.info(`[O2C] Sales Order ${record.orderNumber} confirmed. Checking warehouse inventory...`);

    // Verify inventory availability for each line item
    const items = (await dataAdapter.list('items')).data || [];

    for (const line of record.items || []) {
      const stockItem = items.find(i => i.id === line.itemId || i.sku === line.sku);
      if (stockItem) {
        if (stockItem.currentStock < line.quantity) {
          toast.warning(`[O2C Shortage] Low stock on ${stockItem.name}. Triggering auto-procurement requisition.`);
          await events.emit('inventory.stock.shortage', {
            item: stockItem,
            shortageQty: line.quantity - stockItem.currentStock,
            salesOrder: record
          });
        } else {
          // Reserve inventory
          await dataAdapter.update('items', stockItem.id, {
            currentStock: stockItem.currentStock - line.quantity
          });
        }
      }
    }
  });

  // Shortage auto-triggers Purchase Requisition
  events.on('inventory.stock.shortage', async ({ item, shortageQty, salesOrder }) => {
    const requisition = {
      id: `PO-AUTO-${Date.now().toString().slice(-4)}`,
      poNumber: `PO-AUTO-${Date.now().toString().slice(-4)}`,
      vendorName: 'Primary Fasteners / Steel Partner',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'approved',
      subtotal: (item.costPrice || 250) * shortageQty,
      taxAmount: Math.round(((item.costPrice || 250) * shortageQty) * 0.18),
      grandTotal: Math.round(((item.costPrice || 250) * shortageQty) * 1.18),
      threeWayMatched: false,
      notes: `Auto-generated from O2C shortage for ${salesOrder?.orderNumber || 'SO'}`
    };

    await dataAdapter.create('purchase_orders', requisition);
    toast.success(`[Procure-to-Pay] Auto-created PO ${requisition.poNumber} for ${item.name}!`);
  });

  // Sales Order Dispatched -> Auto create invoice draft & SCM shipment
  events.on('sales.order.dispatched', async ({ record }) => {
    toast.info(`[O2C] Dispatching ${record.orderNumber}. Generating draft invoice & shipping waybill...`);

    const invoice = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
      type: 'sales',
      customerName: record.customerName,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      subtotal: record.subtotal,
      taxAmount: record.taxAmount,
      totalAmount: record.grandTotal,
      status: 'draft',
      paymentStatus: 'unpaid',
      notes: `Generated from Sales Order ${record.orderNumber}`
    };

    await dataAdapter.create('invoices', invoice);

    const shipment = {
      id: `SHP-${Date.now().toString().slice(-4)}`,
      shipmentNumber: `SHP-${Date.now().toString().slice(-4)}`,
      carrier: 'Blue Dart Express',
      trackingNumber: `BD-${Date.now().toString().slice(-6)}`,
      origin: 'Central Plant Pune',
      destination: `${record.customerName} Facility`,
      status: 'in_transit',
      eta: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
    };

    await dataAdapter.create('shipments', shipment);
    toast.success(`[SCM & Finance] Created Invoice ${invoice.invoiceNumber} and Waybill ${shipment.shipmentNumber}!`);
  });

  // Sales Order Invoiced
  events.on('sales.order.invoiced', async ({ record }) => {
    toast.success(`[O2C Complete] Sales Order ${record.orderNumber} successfully billed.`);
  });

  // 2. Procure-to-Pay (P2P): GRN Received -> Increases physical warehouse stock
  events.on('inventory.grn.received', async ({ record }) => {
    toast.info(`[P2P] Goods Receipt Note processed for PO ${record.poNumber}. Updating inventory levels...`);

    const items = (await dataAdapter.list('items')).data || [];
    for (const poItem of record.items || []) {
      const stockItem = items.find(i => i.id === poItem.itemId || i.sku === poItem.sku);
      if (stockItem) {
        await dataAdapter.update('items', stockItem.id, {
          currentStock: stockItem.currentStock + poItem.quantity
        });
        toast.success(`[Inventory] Received ${poItem.quantity} units of ${stockItem.name}. Stock updated!`);
      }
    }
  });

  // Invoice posted -> Auto-post to General Ledger
  events.on('finance.invoice.posted', async ({ record }) => {
    toast.info(`[Finance GL] Posting Invoice ${record.invoiceNumber} to General Ledger accounts...`);

    const total = Number(record.totalAmount) || 0;
    const subtotal = Number(record.subtotal) || total;
    const tax = Number(record.taxAmount) || 0;

    const je = {
      id: `JE-INV-${Date.now().toString().slice(-4)}`,
      entryNumber: `JE-INV-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      description: `Revenue posting for invoice ${record.invoiceNumber}`,
      reference: record.invoiceNumber,
      status: 'posted',
      totalDebit: total,
      totalCredit: total,
      lines: [
        { accountId: '1030', accountName: 'Accounts Receivable', debit: total, credit: 0 },
        { accountId: '4010', accountName: 'Domestic Sales Revenue', debit: 0, credit: subtotal },
        { accountId: '2020', accountName: 'GST Output Payable', debit: 0, credit: tax }
      ]
    };

    await dataAdapter.create('journal_entries', je);
    toast.success(`[GL Sync] Journal Entry ${je.entryNumber} posted automatically!`);
  });

  // 3. Payroll approved -> Auto-post to General Ledger handled in payroll.js

  // 4. Maintenance completed -> Consume spare parts & post expense
  events.on('assets.maintenance.completed', async ({ asset, partsConsumed = [] }) => {
    toast.info(`[Maintenance] Work completed on ${asset.name}. Recording parts consumption...`);

    for (const part of partsConsumed) {
      const items = (await dataAdapter.list('items')).data || [];
      const sp = items.find(i => i.id === part.itemId);
      if (sp) {
        await dataAdapter.update('items', sp.id, {
          currentStock: Math.max(0, sp.currentStock - part.quantity)
        });
      }
    }
    toast.success('[Maintenance Sync] Spare parts inventory deducted.');
  });
}

