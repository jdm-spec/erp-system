/**
 * Append-only Audit Trail Engine
 * Logs user actions, entity mutations, workflow transitions, and schema updates.
 */

import { auth } from './auth.js';

class AuditLogger {
  constructor() {
    this.storageKey = 'erp_audit_trail';
  }

  /**
   * Log an audit event.
   * @param {object} params
   * @param {string} params.module - e.g. 'finance', 'sales'
   * @param {string} params.entity - e.g. 'invoice', 'sales_order'
   * @param {string} params.entityId - ID of record
   * @param {'create'|'update'|'delete'|'workflow'|'login'|'schema_change'} params.action
   * @param {object} [params.changes] - Diff object { field: { old, new } }
   * @param {string} [params.description] - Human readable summary
   */
  async log({ module, entity, entityId, action, changes = null, description = '' }) {
    const user = auth.getCurrentUser() || { name: 'System', email: 'system@erp.local', role: 'system' };
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      user: {
        id: user.id || 'system',
        name: user.name || 'System',
        email: user.email || 'system@erp.local',
        role: user.role || 'system'
      },
      module,
      entity,
      entityId,
      action,
      changes,
      description: description || `${action.toUpperCase()} on ${entity} #${entityId}`
    };

    try {
      const logs = this.getLogs();
      logs.unshift(entry);
      // Keep last 500 records in demo storage
      if (logs.length > 500) logs.pop();
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to append to audit trail:', e);
    }

    return entry;
  }

  /**
   * Get all audit logs.
   * @param {object} [filter]
   * @returns {Array}
   */
  getLogs(filter = {}) {
    try {
      const raw = localStorage.getItem(this.storageKey);
      let logs = raw ? JSON.parse(raw) : [];

      if (filter.module) {
        logs = logs.filter(l => l.module === filter.module);
      }
      if (filter.entity) {
        logs = logs.filter(l => l.entity === filter.entity);
      }
      if (filter.entityId) {
        logs = logs.filter(l => String(l.entityId) === String(filter.entityId));
      }
      return logs;
    } catch (e) {
      return [];
    }
  }

  /**
   * Calculate diff between two objects.
   * @param {object} oldData
   * @param {object} newData
   * @returns {object|null}
   */
  computeDiff(oldData, newData) {
    if (!oldData) return null;
    const diff = {};
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

    for (const key of allKeys) {
      if (key === 'updatedAt' || key === 'createdAt') continue;
      const vOld = oldData[key];
      const vNew = newData[key];

      if (JSON.stringify(vOld) !== JSON.stringify(vNew)) {
        diff[key] = {
          old: vOld !== undefined ? vOld : null,
          new: vNew !== undefined ? vNew : null
        };
      }
    }

    return Object.keys(diff).length > 0 ? diff : null;
  }
}

export const audit = new AuditLogger();

