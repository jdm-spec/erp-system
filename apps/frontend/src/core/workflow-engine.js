/**
 * Minimal & Elegant Workflow and State Machine Engine
 * Executes role-gated state transitions, triggers auto-actions,
 * and renders refined, minimal status badges.
 */

import { events } from './events.js';
import { rbac } from './rbac.js';
import { audit } from './audit.js';

export class WorkflowEngine {
  /**
   * Evaluates available transitions for a given record.
   */
  static getAvailableTransitions(record, workflowDef, currentUser) {
    if (!workflowDef || !workflowDef.transitions || !Array.isArray(workflowDef.transitions)) {
      return [];
    }

    const currentStatus = record.status || workflowDef.initial || 'draft';

    return workflowDef.transitions.filter(transition => {
      if (transition.from !== '*' && transition.from !== currentStatus) {
        return false;
      }

      if (transition.permission && currentUser) {
        if (!rbac.hasPermission(currentUser, transition.permission)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Executes a workflow transition.
   */
  static async executeTransition({ entity, record, transition, dataAdapter, currentUser }) {
    const fromStatus = record.status || 'draft';
    const toStatus = transition.to;

    const updated = await dataAdapter.update(entity, record.id, {
      status: toStatus,
      lastTransitionAt: new Date().toISOString(),
      lastTransitionBy: currentUser?.name || 'System'
    });

    await audit.log({
      module: entity.split('_')[0],
      entity,
      entityId: record.id,
      action: 'workflow',
      changes: { status: { old: fromStatus, new: toStatus } },
      description: `Transitioned from "${fromStatus}" to "${toStatus}" via "${transition.label}"`
    });

    await events.emit(`${entity}.transition`, {
      record: updated,
      from: fromStatus,
      to: toStatus,
      transition
    });

    if (transition.autoAction) {
      if (transition.autoAction.startsWith('emit:')) {
        const customEvent = transition.autoAction.replace('emit:', '');
        await events.emit(customEvent, { record: updated, previousState: record });
      }
    }

    return updated;
  }

  /**
   * Returns minimal, elegant badge style classes for a workflow state.
   */
  static getStatusBadgeClass(status, workflowDef = null) {
    const stateDef = workflowDef?.states?.[status];
    const color = stateDef?.color || 'gray';

    const colorMap = {
      gray: 'bg-zinc-100 text-zinc-700 border-zinc-200/80 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/80',
      blue: 'bg-blue-50/80 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
      indigo: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
      green: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
      emerald: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
      yellow: 'bg-amber-50/80 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
      orange: 'bg-orange-50/80 text-orange-700 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60',
      red: 'bg-rose-50/80 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60'
    };

    return `inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${colorMap[color] || colorMap.gray}`;
  }
}
