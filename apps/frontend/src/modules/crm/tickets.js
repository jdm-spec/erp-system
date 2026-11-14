/**
 * CRM: Support Tickets & SLA Management View
 */

import { dataAdapter } from '../../data/index.js';
import { formatDate } from '../../core/i18n.js';
import { escapeHTML } from '../../core/sanitize.js';
import { toast } from '../../components/toast.js';

export default async function TicketsView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const tickets = (await dataAdapter.list('support_tickets', { limit: 100 })).data || [];

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>🎫</span> Customer Support Tickets & SLA Tracking
        </h1>
        <p class="text-xs text-slate-500 mt-1">Manage technical tickets, SLA response countdowns, and customer satisfaction.</p>
      </div>
      <span class="text-xs font-mono px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-full font-semibold">
        ${tickets.length} Registered Tickets
      </span>
    </div>

    <div class="space-y-4">
      ${tickets.map(t => {
        const isResolved = t.status === 'resolved';

        return `
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">${escapeHTML(t.ticketNumber)}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">${escapeHTML(t.priority || 'Medium')}</span>
                <span class="text-xs text-slate-400">• Created: ${formatDate(t.createdAt)}</span>
              </div>
              <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">${escapeHTML(t.subject)}</h3>
              <p class="text-xs text-slate-500">Customer: <span class="font-medium text-slate-700 dark:text-slate-300">${escapeHTML(t.customerName)}</span></p>
            </div>

            <div class="flex items-center gap-3">
              <div class="text-right">
                <div class="text-[10px] text-slate-400 font-bold uppercase">SLA Target</div>
                <div class="text-xs font-mono font-semibold ${isResolved ? 'text-slate-400' : 'text-amber-600'}">${t.slaHours || 24} Hours Window</div>
              </div>

              ${isResolved
                ? `<span class="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">✓ Resolved</span>`
                : `<button type="button" data-resolve-tck="${escapeHTML(t.id)}" class="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors">Mark Resolved</button>`}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelectorAll('[data-resolve-tck]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-resolve-tck');
      await dataAdapter.update('support_tickets', id, { status: 'resolved' });
      toast.success('Ticket marked as resolved within SLA limit!');
      window.location.reload();
    });
  });

  return container;
}

