/**
 * HRMS: Employee Master Directory View
 */

import { EntityView } from '../../core/entity-view.js';

export default async function EmployeesView() {
  return EntityView.create({
    entityKey: 'employee',
    tableName: 'employees',
    title: 'Employee Register & Staff Directory',
    subtitle: 'Manage employee personal records, designations, department allocation, and leave balances.'
  });
}

