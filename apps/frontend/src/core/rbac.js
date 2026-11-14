/**
 * Role-Based Access Control (RBAC) & Field-Level Permission Engine
 */

export const DEFAULT_ROLES = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Unrestricted system access across all tenants, modules, and configurations',
    permissions: ['*']
  },
  admin: {
    id: 'admin',
    name: 'Company Administrator',
    description: 'Full management of business modules, customization studio, and users',
    permissions: [
      'admin.*', 'finance.*', 'inventory.*', 'procurement.*',
      'sales.*', 'crm.*', 'hrms.*', 'manufacturing.*',
      'scm.*', 'projects.*', 'quality.*', 'assets.*', 'bi.*'
    ]
  },
  finance_manager: {
    id: 'finance_manager',
    name: 'Finance Manager',
    description: 'Manages ledger, invoices, payments, budgets, and financial reporting',
    permissions: [
      'finance.*', 'bi.view', 'bi.reports', 'sales.view', 'procurement.view', 'inventory.view'
    ]
  },
  sales_manager: {
    id: 'sales_manager',
    name: 'Sales & CRM Manager',
    description: 'Manages quotations, sales orders, CRM pipelines, and customer 360',
    permissions: [
      'sales.*', 'crm.*', 'inventory.view', 'bi.view'
    ]
  },
  inventory_manager: {
    id: 'inventory_manager',
    name: 'Inventory & Warehouse Manager',
    description: 'Manages items, stock ledger, transfers, and warehouse bins',
    permissions: [
      'inventory.*', 'procurement.view', 'manufacturing.view', 'bi.view'
    ]
  },
  operations_manager: {
    id: 'operations_manager',
    name: 'Operations & Production Manager',
    description: 'Oversees manufacturing, BOM, work orders, SCM, and quality inspections',
    permissions: [
      'manufacturing.*', 'scm.*', 'quality.*', 'assets.*', 'inventory.*', 'projects.*', 'bi.view'
    ]
  },
  hr_manager: {
    id: 'hr_manager',
    name: 'HR & Payroll Manager',
    description: 'Oversees employee records, attendance, leaves, appraisals, and payroll',
    permissions: [
      'hrms.*', 'bi.view'
    ]
  },
  standard_user: {
    id: 'standard_user',
    name: 'Standard Staff',
    description: 'Standard operational user with view and record entry rights',
    permissions: [
      'sales.view', 'sales.create', 'sales.edit',
      'inventory.view', 'procurement.view', 'crm.view', 'crm.create',
      'hrms.self', 'projects.view', 'projects.edit'
    ]
  }
};

class RbacEngine {
  constructor() {
    this.roles = { ...DEFAULT_ROLES };
    this.loadCustomRoles();
  }

  loadCustomRoles() {
    try {
      const saved = localStorage.getItem('erp_custom_roles');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.roles = { ...DEFAULT_ROLES, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load custom roles from storage:', e);
    }
  }

  saveCustomRoles(customRoles) {
    this.roles = { ...DEFAULT_ROLES, ...customRoles };
    try {
      localStorage.setItem('erp_custom_roles', JSON.stringify(customRoles));
    } catch (e) {
      console.error('Failed to persist custom roles:', e);
    }
  }

  getRoles() {
    return Object.values(this.roles);
  }

  getRole(roleId) {
    return this.roles[roleId] || null;
  }

  /**
   * Evaluates if a user has permission to perform an action.
   * @param {object} user - User object with .role or .permissions
   * @param {string} requiredPermission - e.g. 'finance.invoice.create' or 'sales.view'
   * @returns {boolean}
   */
  hasPermission(user, requiredPermission) {
    if (!user) return false;
    if (!requiredPermission) return true;

    // Gather permissions
    const userRole = this.roles[user.role] || this.roles['standard_user'];
    const permissions = new Set([
      ...(userRole?.permissions || []),
      ...(user.permissions || [])
    ]);

    // Super admin wildcard
    if (permissions.has('*')) return true;

    // Direct match
    if (permissions.has(requiredPermission)) return true;

    // Module / entity wildcard checks
    // e.g. required: 'finance.invoice.create' matches 'finance.*' or 'finance.invoice.*'
    const parts = requiredPermission.split('.');
    for (let i = 1; i <= parts.length; i++) {
      const wildcard = parts.slice(0, i).join('.') + '.*';
      if (permissions.has(wildcard)) return true;
    }

    return false;
  }

  /**
   * Checks if user can perform action on entity.
   * @param {object} user
   * @param {'view'|'create'|'edit'|'delete'|'approve'|'export'} action
   * @param {string} entity
   * @param {string} [fieldId] - Optional field-level check
   * @returns {boolean}
   */
  can(user, action, entity, fieldId = null) {
    if (!user) return false;
    if (user.role === 'super_admin') return true;

    // Field-level check
    if (fieldId) {
      const fieldPerm = `${entity}.${fieldId}.${action}`;
      if (!this.hasPermission(user, fieldPerm) && !this.hasPermission(user, `${entity}.${fieldId}.*`)) {
        // Fall back to general entity check
        return this.hasPermission(user, `${entity}.${action}`);
      }
      return true;
    }

    return this.hasPermission(user, `${entity}.${action}`);
  }
}

export const rbac = new RbacEngine();
export const can = (user, action, entity, field) => rbac.can(user, action, entity, field);
export const hasPermission = (user, perm) => rbac.hasPermission(user, perm);

