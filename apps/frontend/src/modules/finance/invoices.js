/**
 * Finance: Invoices View
 */

import { EntityView } from '../../core/entity-view.js';

export default async function InvoicesView() {
  return EntityView.create({
    entityKey: 'invoice',
    tableName: 'invoices',
    title: 'Invoices & Billing',
    subtitle: 'Manage accounts receivable sales invoices and accounts payable purchase bills.'
  });
}

