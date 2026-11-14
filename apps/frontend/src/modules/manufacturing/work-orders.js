/**
 * Manufacturing: Work Orders View
 */

import { EntityView } from '../../core/entity-view.js';

export default async function WorkOrdersView() {
  return EntityView.create({
    entityKey: 'work_order',
    tableName: 'work_orders',
    title: 'Manufacturing Work Orders & Shop Floor Status',
    subtitle: 'Manage production runs, batch scheduling, output yields, and material consumption.'
  });
}

