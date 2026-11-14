/**
 * Procurement: Purchase Orders View
 */

import { EntityView } from '../../core/entity-view.js';

export default async function PurchaseOrdersView() {
  return EntityView.create({
    entityKey: 'purchase_order',
    tableName: 'purchase_orders',
    title: 'Purchase Orders & Requisitions',
    subtitle: 'Manage supplier procurement, PO approval workflows, and delivery commitments.'
  });
}

