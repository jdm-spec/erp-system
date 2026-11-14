/**
 * Sales: Orders View
 */

import { EntityView } from '../../core/entity-view.js';

export default async function SalesOrdersView() {
  return EntityView.create({
    entityKey: 'sales_order',
    tableName: 'sales_orders',
    title: 'Sales Orders & Fulfillment',
    subtitle: 'Manage quotations, confirmed customer sales orders, deliveries, and billing.'
  });
}

