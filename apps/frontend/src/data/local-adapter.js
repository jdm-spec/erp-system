/**
 * Standalone Local Storage / IndexedDB Data Adapter
 * Provides persistent in-browser storage, query filtering, sorting, pagination,
 * and comprehensive initial business seed data across all 12 ERP modules.
 */

import { DataAdapter } from './adapter.js';
import { audit } from '../core/audit.js';

const DB_PREFIX = 'erp_db_';

// Initial Seed Datasets for all ERP modules
const INITIAL_SEEDS = {
  // 1. Finance & Accounting
  accounts: [
    { id: '1010', code: '1010', name: 'Cash on Hand', type: 'Asset', subType: 'Current Asset', balance: 450000, currency: 'INR' },
    { id: '1020', code: '1020', name: 'HDFC Bank - Current A/C', type: 'Asset', subType: 'Bank', balance: 3420000, currency: 'INR' },
    { id: '1030', code: '1030', name: 'Accounts Receivable', type: 'Asset', subType: 'Current Asset', balance: 1850000, currency: 'INR' },
    { id: '1040', code: '1040', name: 'Raw Material Inventory', type: 'Asset', subType: 'Inventory', balance: 2100000, currency: 'INR' },
    { id: '1050', code: '1050', name: 'Finished Goods Inventory', type: 'Asset', subType: 'Inventory', balance: 1650000, currency: 'INR' },
    { id: '2010', code: '2010', name: 'Accounts Payable', type: 'Liability', subType: 'Current Liability', balance: 1240000, currency: 'INR' },
    { id: '2020', code: '2020', name: 'GST Output Payable (IGST/CGST/SGST)', type: 'Liability', subType: 'Tax', balance: 285000, currency: 'INR' },
    { id: '3010', code: '3010', name: 'Paid Up Equity Capital', type: 'Equity', subType: 'Capital', balance: 5000000, currency: 'INR' },
    { id: '4010', code: '4010', name: 'Domestic Sales Revenue', type: 'Income', subType: 'Operating Revenue', balance: 6420000, currency: 'INR' },
    { id: '5010', code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'Expense', subType: 'Direct Expense', balance: 3820000, currency: 'INR' },
    { id: '5020', code: '5020', name: 'Factory Overhead & Utilities', type: 'Expense', subType: 'Operating Expense', balance: 340000, currency: 'INR' },
    { id: '5030', code: '5030', name: 'Staff Salaries & Wages', type: 'Expense', subType: 'Payroll', balance: 950000, currency: 'INR' }
  ],
  journal_entries: [
    {
      id: 'JE-2026-001',
      entryNumber: 'JE-2026-001',
      date: '2026-03-01',
      description: 'Monthly payroll accrual & direct disbursement',
      reference: 'PAYROLL-FEB-2026',
      status: 'posted',
      lines: [
        { accountId: '5030', accountName: 'Staff Salaries & Wages', debit: 950000, credit: 0 },
        { accountId: '1020', accountName: 'HDFC Bank - Current A/C', debit: 0, credit: 950000 }
      ],
      totalDebit: 950000,
      totalCredit: 950000
    },
    {
      id: 'JE-2026-002',
      entryNumber: 'JE-2026-002',
      date: '2026-03-03',
      description: 'Vendor payment settlement for Precision Castings',
      reference: 'PAY-PC-009',
      status: 'posted',
      lines: [
        { accountId: '2010', accountName: 'Accounts Payable', debit: 240000, credit: 0 },
        { accountId: '1020', accountName: 'HDFC Bank - Current A/C', debit: 0, credit: 240000 }
      ],
      totalDebit: 240000,
      totalCredit: 240000
    }
  ],
  invoices: [
    {
      id: 'INV-2026-001',
      invoiceNumber: 'INV-2026-001',
      type: 'sales',
      customerId: 'CUST-001',
      customerName: 'Bharat Heavy Engineering Ltd',
      date: '2026-03-02',
      dueDate: '2026-04-01',
      status: 'posted',
      paymentStatus: 'unpaid',
      subtotal: 350000,
      taxAmount: 63000,
      totalAmount: 413000,
      notes: 'Payment terms Net 30'
    },
    {
      id: 'INV-2026-002',
      invoiceNumber: 'INV-2026-002',
      type: 'sales',
      customerId: 'CUST-002',
      customerName: 'Tata AutoComp Systems',
      date: '2026-03-04',
      dueDate: '2026-04-03',
      status: 'paid',
      paymentStatus: 'paid',
      subtotal: 520000,
      taxAmount: 93600,
      totalAmount: 613600,
      notes: 'Settled via RTGS Ref 77481'
    }
  ],

  // 2. Inventory & Warehouse
  items: [
    {
      id: 'ITM-001',
      sku: 'RM-STEEL-304',
      name: 'Stainless Steel Sheet 304 (2mm)',
      category: 'Raw Materials',
      unit: 'KG',
      costPrice: 240,
      sellingPrice: 320,
      currentStock: 4500,
      reorderPoint: 1000,
      warehouse: 'WH-MAIN-PUNE',
      bin: 'A-12-04',
      valuationMethod: 'FIFO',
      status: 'active'
    },
    {
      id: 'ITM-002',
      sku: 'RM-ALUM-6061',
      name: 'Aluminium Bar 6061-T6 (50mm)',
      category: 'Raw Materials',
      unit: 'KG',
      costPrice: 310,
      sellingPrice: 420,
      currentStock: 1800,
      reorderPoint: 500,
      warehouse: 'WH-MAIN-PUNE',
      bin: 'A-14-02',
      valuationMethod: 'FIFO',
      status: 'active'
    },
    {
      id: 'ITM-003',
      sku: 'FG-VALVE-IND50',
      name: 'Industrial High-Pressure Gate Valve 50mm',
      category: 'Finished Goods',
      unit: 'PCS',
      costPrice: 4200,
      sellingPrice: 6800,
      currentStock: 350,
      reorderPoint: 100,
      warehouse: 'WH-BHIWANDI-FG',
      bin: 'FG-01-10',
      valuationMethod: 'FIFO',
      status: 'active'
    },
    {
      id: 'ITM-004',
      sku: 'SP-SEAL-EPDM',
      name: 'High-Temp EPDM O-Ring Seal Set',
      category: 'Spare Parts',
      unit: 'SET',
      costPrice: 180,
      sellingPrice: 350,
      currentStock: 1200,
      reorderPoint: 300,
      warehouse: 'WH-MAIN-PUNE',
      bin: 'SP-08-01',
      valuationMethod: 'weighted_average',
      status: 'active'
    }
  ],
  warehouses: [
    { id: 'WH-MAIN-PUNE', code: 'WH-PUN', name: 'Plant 1 Central Warehouse - Pune', location: 'Chakan MIDC, Pune', manager: 'Anil Kulkarni', capacitySqFt: 45000 },
    { id: 'WH-BHIWANDI-FG', code: 'WH-BHW', name: 'Finished Goods Hub - Bhiwandi', location: 'Bhiwandi Logistics Park, Thane', manager: 'Sunil Rao', capacitySqFt: 75000 }
  ],

  // 3. Procurement
  vendors: [
    { id: 'VEN-001', code: 'VEN-001', name: 'Jindal Steel & Power Ltd', rating: 4.8, gstin: '27AABCS1429B1Z1', paymentTerms: 'Net 45', email: 'sales@jindalsteel.com', phone: '+91 22 6678 9000' },
    { id: 'VEN-002', code: 'VEN-002', name: 'Hindalco Industries Ltd', rating: 4.6, gstin: '27AAACH0123P1Z9', paymentTerms: 'Net 30', email: 'orders@hindalco.adityabirla.com', phone: '+91 22 6662 6666' },
    { id: 'VEN-003', code: 'VEN-003', name: 'Precision Seals & Packings', rating: 4.2, gstin: '27AAECP4589D1Z4', paymentTerms: 'Net 15', email: 'contact@precisionseals.in', phone: '+91 20 2712 3456' }
  ],
  purchase_orders: [
    {
      id: 'PO-2026-001',
      poNumber: 'PO-2026-001',
      vendorId: 'VEN-001',
      vendorName: 'Jindal Steel & Power Ltd',
      orderDate: '2026-03-01',
      expectedDate: '2026-03-15',
      status: 'approved',
      items: [
        { itemId: 'ITM-001', itemName: 'Stainless Steel Sheet 304', quantity: 2000, unitPrice: 240, taxRate: 18, total: 566400 }
      ],
      subtotal: 480000,
      taxAmount: 86400,
      grandTotal: 566400,
      threeWayMatched: true
    }
  ],

  // 4. Sales & Distribution
  customers: [
    { id: 'CUST-001', code: 'CUST-001', name: 'Bharat Heavy Engineering Ltd', gstin: '27AAACB0000A1Z2', creditLimit: 2500000, outstandingBalance: 413000, city: 'Mumbai', state: 'Maharashtra', contactPerson: 'K. V. Raman', phone: '+91 22 2555 1234' },
    { id: 'CUST-002', code: 'CUST-002', name: 'Tata AutoComp Systems', gstin: '27AAACT8888D1Z8', creditLimit: 5000000, outstandingBalance: 0, city: 'Pune', state: 'Maharashtra', contactPerson: 'Sanjay Deshmukh', phone: '+91 20 6608 5000' },
    { id: 'CUST-003', code: 'CUST-003', name: 'Larsen & Toubro Hydrocarbon', gstin: '24AAACL0123E1Z4', creditLimit: 8000000, outstandingBalance: 1250000, city: 'Vadodara', state: 'Gujarat', contactPerson: 'Mehul Mehta', phone: '+91 265 245 6789' }
  ],
  sales_orders: [
    {
      id: 'SO-2026-001',
      orderNumber: 'SO-2026-001',
      customerId: 'CUST-001',
      customerName: 'Bharat Heavy Engineering Ltd',
      orderDate: '2026-03-01',
      deliveryDate: '2026-03-20',
      status: 'confirmed',
      items: [
        { itemId: 'ITM-003', itemName: 'Industrial High-Pressure Gate Valve 50mm', quantity: 50, unitPrice: 6800, taxRate: 18, total: 401200 }
      ],
      subtotal: 340000,
      taxAmount: 61200,
      grandTotal: 401200
    },
    {
      id: 'SO-2026-002',
      orderNumber: 'SO-2026-002',
      customerId: 'CUST-002',
      customerName: 'Tata AutoComp Systems',
      orderDate: '2026-03-03',
      deliveryDate: '2026-03-25',
      status: 'invoiced',
      items: [
        { itemId: 'ITM-003', itemName: 'Industrial High-Pressure Gate Valve 50mm', quantity: 75, unitPrice: 6600, taxRate: 18, total: 584100 }
      ],
      subtotal: 495000,
      taxAmount: 89100,
      grandTotal: 584100
    }
  ],

  // 5. CRM
  leads: [
    { id: 'LEAD-101', name: 'Vikram Joshi', company: 'Thermax Energy Systems', stage: 'Qualified', potentialValue: 1200000, email: 'vjoshi@thermax.com', phone: '+91 20 6605 1200', source: 'Trade Expo' },
    { id: 'LEAD-102', name: 'Arun Iyer', company: 'Suzlon Energy Ltd', stage: 'Negotiation', potentialValue: 2800000, email: 'aiyer@suzlon.com', phone: '+91 20 6702 2000', source: 'Direct Inbound' },
    { id: 'LEAD-103', name: 'Deepa Nair', company: 'Godrej & Boyce Aerospace', stage: 'Proposal Sent', potentialValue: 4500000, email: 'dnair@godrej.com', phone: '+91 22 6796 1111', source: 'Referral' }
  ],
  support_tickets: [
    { id: 'TCK-201', ticketNumber: 'TCK-201', customerName: 'Bharat Heavy Engineering Ltd', subject: 'Mounting bracket dimension inquiry', priority: 'Medium', status: 'open', slaHours: 24, createdAt: '2026-03-05' },
    { id: 'TCK-202', ticketNumber: 'TCK-202', customerName: 'Tata AutoComp Systems', subject: 'Calibration certificate copy request', priority: 'Low', status: 'resolved', slaHours: 48, createdAt: '2026-03-02' }
  ],

  // 6. HRMS & Payroll
  employees: [
    { id: 'EMP-001', code: 'EMP-001', name: 'Rajesh Sharma', department: 'Operations', designation: 'Plant Supervisor', baseSalary: 75000, joiningDate: '2022-04-10', status: 'active', leavesBalance: 16 },
    { id: 'EMP-002', code: 'EMP-002', name: 'Sneha Patel', department: 'Finance', designation: 'Senior Accountant', baseSalary: 65000, joiningDate: '2023-01-15', status: 'active', leavesBalance: 14 },
    { id: 'EMP-003', code: 'EMP-003', name: 'Amitabh Sen', department: 'Engineering', designation: 'Quality Lead Engineer', baseSalary: 85000, joiningDate: '2021-08-01', status: 'active', leavesBalance: 18 }
  ],
  payrolls: [
    { id: 'PAY-2026-02', month: 'February 2026', totalEmployees: 42, grossPay: 1850000, totalDeductions: 195000, netPay: 1655000, status: 'approved', processedDate: '2026-03-01' }
  ],

  // 7. Manufacturing & Production
  boms: [
    {
      id: 'BOM-001',
      bomNumber: 'BOM-VALVE-50',
      finishedItemId: 'ITM-003',
      finishedItemName: 'Industrial High-Pressure Gate Valve 50mm',
      batchSize: 10,
      components: [
        { itemId: 'ITM-001', itemName: 'Stainless Steel Sheet 304', qty: 25, unit: 'KG' },
        { itemId: 'ITM-002', itemName: 'Aluminium Bar 6061-T6', qty: 8, unit: 'KG' },
        { itemId: 'ITM-004', itemName: 'High-Temp EPDM O-Ring Seal Set', qty: 10, unit: 'SET' }
      ]
    }
  ],
  work_orders: [
    { id: 'WO-2026-01', orderNumber: 'WO-2026-01', bomId: 'BOM-001', itemName: 'Gate Valve 50mm', quantity: 50, produced: 35, status: 'in_progress', startDate: '2026-03-01', endDate: '2026-03-12' },
    { id: 'WO-2026-02', orderNumber: 'WO-2026-02', bomId: 'BOM-001', itemName: 'Gate Valve 50mm', quantity: 30, produced: 0, status: 'scheduled', startDate: '2026-03-15', endDate: '2026-03-24' }
  ],

  // 8. Supply Chain Management
  shipments: [
    { id: 'SHP-101', shipmentNumber: 'SHP-101', carrier: 'Blue Dart Express', trackingNumber: 'BD-884910223', origin: 'Pune Plant', destination: 'Mumbai Hub', status: 'in_transit', eta: '2026-03-09' },
    { id: 'SHP-102', shipmentNumber: 'SHP-102', carrier: 'TCI Freight', trackingNumber: 'TCI-99412', origin: 'Pune Plant', destination: 'Vadodara Client Site', status: 'delivered', eta: '2026-03-04' }
  ],

  // 9. Projects
  projects: [
    { id: 'PRJ-01', code: 'PRJ-01', name: 'Automated Assembly Line Expansion', manager: 'Anil Kulkarni', budget: 3500000, spent: 1450000, progress: 45, status: 'active' },
    { id: 'PRJ-02', code: 'PRJ-02', name: 'ISO 9001:2015 Recertification Audit', manager: 'Amitabh Sen', budget: 450000, spent: 220000, progress: 65, status: 'active' }
  ],

  // 10. Quality Management
  inspections: [
    { id: 'INSP-501', number: 'INSP-501', type: 'Incoming Material', target: 'SS Sheet 304 Lot #441', inspector: 'Amitabh Sen', status: 'passed', defectCount: 0, date: '2026-03-02' },
    { id: 'INSP-502', number: 'INSP-502', type: 'Final Assembly', target: 'Gate Valve Batch #99', inspector: 'Amitabh Sen', status: 'passed', defectCount: 1, date: '2026-03-04' }
  ],

  // 11. Assets & Maintenance
  assets: [
    { id: 'AST-01', assetTag: 'EQP-CNC-01', name: 'Doosan 5-Axis CNC Milling Center', location: 'Machine Shop Bay 2', purchaseCost: 8500000, currentValue: 6200000, status: 'operational', nextServiceDate: '2026-03-25' },
    { id: 'AST-02', assetTag: 'EQP-COMP-02', name: 'Atlas Copco Rotary Screw Air Compressor', location: 'Utilities Block', purchaseCost: 1200000, currentValue: 850000, status: 'operational', nextServiceDate: '2026-04-10' }
  ],
  maintenance_orders: [
    { id: 'MO-101', orderNumber: 'MO-101', assetTag: 'EQP-CNC-01', type: 'Preventive', description: 'Quarterly spindle calibration and hydraulic filter replacement', status: 'scheduled', plannedDate: '2026-03-25' }
  ],

  // 12. BI & Analytics Metric Snapshots
  bi_kpis: [
    { id: 'revenue_mtd', label: 'Revenue (MTD)', value: 1163000, change: '+14.2%', trend: 'up' },
    { id: 'operating_profit', label: 'Gross Margin', value: 42.5, unit: '%', change: '+2.1%', trend: 'up' },
    { id: 'stock_valuation', label: 'Inventory Holding', value: 3750000, change: '-3.5%', trend: 'neutral' },
    { id: 'open_orders', label: 'Open Sales Pipeline', value: 985300, change: '+8.4%', trend: 'up' }
  ]
};

export class LocalAdapter extends DataAdapter {
  constructor() {
    super();
    this.name = 'Local';
    this.seedDatabaseIfEmpty();
  }

  getKey(entity) {
    return `${DB_PREFIX}${entity}`;
  }

  seedDatabaseIfEmpty() {
    for (const [entity, data] of Object.entries(INITIAL_SEEDS)) {
      const key = this.getKey(entity);
      if (!localStorage.getItem(key)) {
        try {
          localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
          console.warn(`[LocalAdapter] Failed to seed ${entity}:`, e);
        }
      }
    }
  }

  readAll(entity) {
    try {
      const raw = localStorage.getItem(this.getKey(entity));
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error(`[LocalAdapter] Read failed for ${entity}:`, e);
      return [];
    }
  }

  saveAll(entity, items) {
    try {
      localStorage.setItem(this.getKey(entity), JSON.stringify(items));
      return true;
    } catch (e) {
      console.error(`[LocalAdapter] Write failed for ${entity}:`, e);
      return false;
    }
  }

  async list(entity, params = {}) {
    let items = this.readAll(entity);

    // Apply soft delete filter
    if (!params.includeDeleted) {
      items = items.filter(item => !item._deleted);
    }

    // Free text search
    if (params.search) {
      const q = String(params.search).toLowerCase().trim();
      items = items.filter(item => {
        return Object.values(item).some(v => 
          v !== null && v !== undefined && String(v).toLowerCase().includes(q)
        );
      });
    }

    // Key-value filtering
    if (params.filter && typeof params.filter === 'object') {
      for (const [field, expected] of Object.entries(params.filter)) {
        if (expected !== undefined && expected !== null && expected !== '') {
          items = items.filter(item => String(item[field]) === String(expected));
        }
      }
    }

    // Sorting
    if (params.sortBy) {
      const field = params.sortBy;
      const asc = params.sortOrder !== 'desc';
      items.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
    }

    const total = items.length;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 25;
    const startIndex = (page - 1) * limit;
    const pagedData = items.slice(startIndex, startIndex + limit);

    return {
      data: pagedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async get(entity, id) {
    const items = this.readAll(entity);
    const item = items.find(i => String(i.id) === String(id) && !i._deleted);
    return item ? { ...item } : null;
  }

  async create(entity, data) {
    const items = this.readAll(entity);
    const id = data.id || `${entity.slice(0, 3).toUpperCase()}-${Date.now()}`;
    const newRecord = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    items.unshift(newRecord);
    this.saveAll(entity, items);

    await audit.log({
      module: entity.split('_')[0],
      entity,
      entityId: id,
      action: 'create',
      changes: newRecord
    });

    return { ...newRecord };
  }

  async update(entity, id, data) {
    const items = this.readAll(entity);
    const index = items.findIndex(i => String(i.id) === String(id));
    if (index === -1) {
      throw new Error(`Record ${id} in ${entity} not found`);
    }

    const oldRecord = items[index];
    const updatedRecord = {
      ...oldRecord,
      ...data,
      id: oldRecord.id, // preserve primary key
      updatedAt: new Date().toISOString()
    };

    items[index] = updatedRecord;
    this.saveAll(entity, items);

    const diff = audit.computeDiff(oldRecord, updatedRecord);
    if (diff) {
      await audit.log({
        module: entity.split('_')[0],
        entity,
        entityId: id,
        action: 'update',
        changes: diff
      });
    }

    return { ...updatedRecord };
  }

  async remove(entity, id, hardDelete = false) {
    const items = this.readAll(entity);
    const index = items.findIndex(i => String(i.id) === String(id));
    if (index === -1) return false;

    if (hardDelete) {
      items.splice(index, 1);
    } else {
      items[index]._deleted = true;
      items[index].deletedAt = new Date().toISOString();
    }

    this.saveAll(entity, items);

    await audit.log({
      module: entity.split('_')[0],
      entity,
      entityId: id,
      action: 'delete'
    });

    return true;
  }

  async query(entity, predicateOrFilter) {
    const items = this.readAll(entity).filter(i => !i._deleted);
    if (typeof predicateOrFilter === 'function') {
      return items.filter(predicateOrFilter);
    }
    if (typeof predicateOrFilter === 'object') {
      return items.filter(item => {
        return Object.entries(predicateOrFilter).every(([k, v]) => String(item[k]) === String(v));
      });
    }
    return items;
  }

  async transaction(operations) {
    // In local storage, simulate transactional commit with rollback on failure
    const backup = {};
    for (const op of operations) {
      if (!backup[op.entity]) {
        backup[op.entity] = this.readAll(op.entity);
      }
    }

    try {
      for (const op of operations) {
        if (op.type === 'create') {
          await this.create(op.entity, op.data);
        } else if (op.type === 'update') {
          await this.update(op.entity, op.id, op.data);
        } else if (op.type === 'delete') {
          await this.remove(op.entity, op.id);
        }
      }
      return true;
    } catch (e) {
      // Rollback
      for (const [entity, data] of Object.entries(backup)) {
        this.saveAll(entity, data);
      }
      console.error('[LocalAdapter] Transaction failed and rolled back:', e);
      throw e;
    }
  }

  resetAllData() {
    for (const entity of Object.keys(INITIAL_SEEDS)) {
      localStorage.removeItem(this.getKey(entity));
    }
    localStorage.removeItem('erp_audit_trail');
    this.seedDatabaseIfEmpty();
  }
}

export const localAdapter = new LocalAdapter();

