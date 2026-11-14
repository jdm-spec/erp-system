/**
 * Quality: Inspection Checklist & Audit View
 */

import { EntityView } from '../../core/entity-view.js';

export default async function InspectionsView() {
  return EntityView.create({
    entityKey: 'inspection',
    tableName: 'inspections',
    title: 'Quality Assurance & Material Inspections',
    subtitle: 'Manage incoming goods QA, in-process calibration, defect logging, and CAPA compliance.'
  });
}

