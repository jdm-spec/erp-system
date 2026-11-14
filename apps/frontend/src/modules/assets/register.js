/**
 * Assets: Equipment Register & Maintenance View
 */

import { EntityView } from '../../core/entity-view.js';

export default async function AssetsView() {
  return EntityView.create({
    entityKey: 'asset',
    tableName: 'assets',
    title: 'Fixed Asset Register & Preventive Maintenance',
    subtitle: 'Track heavy industrial machinery, net book values, historical depreciation, and service schedules.'
  });
}

