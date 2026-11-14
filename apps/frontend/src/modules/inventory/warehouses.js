/**
 * Inventory: Warehouses & Bin Locations View
 */

import { dataAdapter } from '../../data/index.js';
import { escapeHTML } from '../../core/sanitize.js';

export default async function WarehousesView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const [whRes, itemsRes] = await Promise.all([
    dataAdapter.list('warehouses', { limit: 50 }),
    dataAdapter.list('items', { limit: 100 })
  ]);

  const warehouses = whRes.data || [];
  const items = itemsRes.data || [];

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>🏭</span> Multi-Warehouse & Bin Locations
        </h1>
        <p class="text-xs text-slate-500 mt-1">Manage physical warehouses, storage bays, and inventory distribution.</p>
      </div>
      <span class="text-xs font-mono px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-full font-semibold">
        ${warehouses.length} Active Hubs
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      ${warehouses.map(wh => {
        const whItems = items.filter(i => i.warehouse === wh.id);
        const totalUnits = whItems.reduce((sum, i) => sum + (Number(i.currentStock) || 0), 0);

        return `
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">${escapeHTML(wh.name)}</h3>
                <span class="text-xs text-slate-400 font-mono">${escapeHTML(wh.id)} • ${escapeHTML(wh.location)}</span>
              </div>
              <span class="text-xs font-mono font-bold text-indigo-600">${wh.capacitySqFt?.toLocaleString() || 50000} sq.ft</span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span class="text-slate-400 block text-[10px] uppercase">Manager</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">${escapeHTML(wh.manager || 'Site Manager')}</span>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span class="text-slate-400 block text-[10px] uppercase">Stocked Units</span>
                <span class="font-bold text-slate-800 dark:text-slate-200 font-mono">${totalUnits.toLocaleString()} Units</span>
              </div>
            </div>

            <div>
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Stored SKUs:</div>
              <ul class="space-y-1.5 text-xs max-h-40 overflow-y-auto">
                ${whItems.map(i => `
                  <li class="flex justify-between p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <span class="text-slate-700 dark:text-slate-300 truncate max-w-xs">${escapeHTML(i.name)}</span>
                    <span class="font-mono font-semibold">${i.currentStock} ${escapeHTML(i.unit)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  return container;
}

