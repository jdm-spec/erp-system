/**
 * Append-only Audit Trail Viewer View
 */

import { audit } from '../../../core/audit.js';
import { formatDate } from '../../../core/i18n.js';
import { escapeHTML } from '../../../core/sanitize.js';

export default async function AuditView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const logs = audit.getLogs();

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>📜</span> System Audit Trail
        </h1>
        <p class="text-xs text-slate-500 mt-1">Immutable, append-only record of all entity mutations, workflows, and actor changes.</p>
      </div>
      <span class="text-xs font-mono px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-semibold">
        ${logs.length} Logged Entries
      </span>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
          <tr>
            <th class="py-3 px-4">Timestamp</th>
            <th class="py-3 px-4">Actor</th>
            <th class="py-3 px-4">Action</th>
            <th class="py-3 px-4">Entity</th>
            <th class="py-3 px-4">Target ID</th>
            <th class="py-3 px-4">Details / Diff</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          ${logs.length === 0 ? `
            <tr>
              <td colspan="6" class="py-8 text-center text-slate-400">No audit events recorded yet</td>
            </tr>
          ` : logs.map(l => {
            const actionBadge = l.action === 'create'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : l.action === 'delete'
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';

            const diffText = l.changes
              ? `<pre class="font-mono text-[10px] text-slate-600 dark:text-slate-400 max-w-xs truncate">${escapeHTML(JSON.stringify(l.changes))}</pre>`
              : escapeHTML(l.description || '-');

            return `
              <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td class="py-3 px-4 whitespace-nowrap text-slate-500">${formatDate(l.timestamp, true)}</td>
                <td class="py-3 px-4 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">${escapeHTML(l.user?.name || 'System')}</td>
                <td class="py-3 px-4 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${actionBadge}">${escapeHTML(l.action)}</span>
                </td>
                <td class="py-3 px-4 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">${escapeHTML(l.entity)}</td>
                <td class="py-3 px-4 whitespace-nowrap font-mono font-medium">${escapeHTML(l.entityId)}</td>
                <td class="py-3 px-4">${diffText}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  return container;
}

