/**
 * Inventory: Items Catalog View
 */

import { EntityView } from '../../core/entity-view.js';

export default async function ItemsView() {
  return EntityView.create({
    entityKey: 'item',
    tableName: 'items',
    title: 'Items & SKU Inventory',
    subtitle: 'Manage material master records, unit costs, stock on hand, and reorder levels.'
  });
}

