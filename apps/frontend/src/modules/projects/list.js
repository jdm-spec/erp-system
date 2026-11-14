/**
 * Projects: Project Portfolio & Milestone View
 */

import { EntityView } from '../../core/entity-view.js';

export default async function ProjectsView() {
  return EntityView.create({
    entityKey: 'project',
    tableName: 'projects',
    title: 'Enterprise Capital Projects & Milestones',
    subtitle: 'Track approved project budgets, actual costs incurred, milestone progress, and manager allocation.'
  });
}

