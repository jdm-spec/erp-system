/**
 * Manufacturing: Multi-Level Bills of Materials (BOM) View
 */

import { dataAdapter } from '../../data/index.js';
import { escapeHTML } from '../../core/sanitize.js';

export default async function BomsView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const boms = (await dataAdapter.list('boms', { limit: 50 })).data || [];

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>⚙️</span> Bills of Materials (BOM Engineering)
        </h1>
        <p class="text-xs text-slate-500 mt-1">Multi-level assembly structures, components, and standard batch recipes.</p>
      </div>
      <span class="text-xs font-mono px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-full font-semibold">
        ${boms.length} Active Production BOMs
      </span>
    </div>

    <div class="space-y-6">
      ${boms.map(bom => `
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span class="font-bold text-sm text-slate-900 dark:text-slate-100">${escapeHTML(bom.bomNumber)}</span>
              <span class="text-xs text-slate-400 ml-2">Output: <strong class="text-slate-700 dark:text-slate-300">${escapeHTML(bom.finishedItemName)}</strong></span>
            </div>
            <span class="text-xs font-mono px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
              Standard Batch Size: <strong>${bom.batchSize || 10} Units</strong>
            </span>
          </div>

          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Required Bill of Materials Components:</div>
            <table class="w-full text-xs text-left">
              <thead class="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th class="py-2">Item ID</th>
                  <th class="py-2">Component Name</th>
                  <th class="py-2 text-right">Qty Per Batch</th>
                  <th class="py-2 text-right">Unit of Measure</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/40">
                ${(bom.components || []).map(c => `
                  <tr>
                    <td class="py-2.5 font-mono text-slate-400 font-medium">${escapeHTML(c.itemId)}</td>
                    <td class="py-2.5 font-semibold text-slate-800 dark:text-slate-200">${escapeHTML(c.itemName)}</td>
                    <td class="py-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">${c.qty}</td>
                    <td class="py-2.5 text-right font-mono text-slate-500">${escapeHTML(c.unit)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return container;
}

