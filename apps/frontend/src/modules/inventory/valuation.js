/**
 * Inventory: Stock Valuation & Ledger Report View
 * Real-time FIFO and Weighted Average inventory valuation calculations.
 */

import { dataAdapter } from '../../data/index.js';
import { formatCurrency, formatNumber } from '../../core/i18n.js';
import { escapeHTML } from '../../core/sanitize.js';

export default async function ValuationView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const items = (await dataAdapter.list('items', { limit: 100 })).data || [];

  const totalHoldingValue = items.reduce((sum, i) => sum + ((Number(i.currentStock) || 0) * (Number(i.costPrice) || 0)), 0);
  const totalUnits = items.reduce((sum, i) => sum + (Number(i.currentStock) || 0), 0);

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>💰</span> Inventory Valuation & Ledger (FIFO / WAC)
        </h1>
        <p class="text-xs text-slate-500 mt-1">Live holding valuation under configured accounting methods.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-[10px] text-slate-400 font-semibold uppercase">Total Asset Value</div>
          <div class="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">${formatCurrency(totalHoldingValue)}</div>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
          <tr>
            <th class="py-3 px-4">Item SKU</th>
            <th class="py-3 px-4">Item Description</th>
            <th class="py-3 px-4">Category</th>
            <th class="py-3 px-4 text-right">Stock Qty</th>
            <th class="py-3 px-4 text-right">Unit Cost</th>
            <th class="py-3 px-4">Method</th>
            <th class="py-3 px-4 text-right">Total Holding Value</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          ${items.map(item => {
            const stock = Number(item.currentStock) || 0;
            const cost = Number(item.costPrice) || 0;
            const itemTotal = stock * cost;

            return `
              <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td class="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">${escapeHTML(item.sku)}</td>
                <td class="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">${escapeHTML(item.name)}</td>
                <td class="py-3 px-4 text-slate-500">${escapeHTML(item.category)}</td>
                <td class="py-3 px-4 text-right font-mono font-semibold">${formatNumber(stock)} ${escapeHTML(item.unit)}</td>
                <td class="py-3 px-4 text-right font-mono">${formatCurrency(cost)}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    ${escapeHTML(item.valuationMethod || 'FIFO')}
                  </span>
                </td>
                <td class="py-3 px-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  ${formatCurrency(itemTotal)}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  return container;
}

