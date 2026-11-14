/**
 * CRM: Leads & Opportunity Pipeline View
 */

import { EntityView } from '../../core/entity-view.js';

export default async function LeadsView() {
  return EntityView.create({
    entityKey: 'lead',
    tableName: 'leads',
    title: 'CRM Leads & Opportunities Pipeline',
    subtitle: 'Track deal stages, prospective deal values, contact details, and conversion metrics.'
  });
}

