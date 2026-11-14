/**
 * RBAC Roles and Permissions Management View
 */

import { rbac, DEFAULT_ROLES } from '../../../core/rbac.js';
import { toast } from '../../../components/toast.js';
import { escapeHTML } from '../../../core/sanitize.js';

export default async function RolesView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const roles = rbac.getRoles();

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>👥</span> Roles & Permissions (RBAC)
        </h1>
        <p class="text-xs text-slate-500 mt-1">Manage enterprise security roles and granular module/action rights.</p>
      </div>
      <span class="text-xs font-mono px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-full font-semibold">
        ${roles.length} System Roles
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${roles.map(r => `
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">${escapeHTML(r.name)}</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">${escapeHTML(r.id)}</span>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">${escapeHTML(r.description || 'Enterprise role')}</p>
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Granted Permissions:</div>
            <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              ${(r.permissions || []).map(p => `
                <span class="px-2 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold">
                  ${escapeHTML(p)}
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return container;
}

