/**
 * Finance: Financial Statements View
 * Renders Balance Sheet, Profit & Loss (P&L), and Trial Balance.
 */

import { dataAdapter } from '../../data/index.js';
import { formatCurrency } from '../../core/i18n.js';
import { escapeHTML } from '../../core/sanitize.js';

export default async function FinancialReportsView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const accounts = (await dataAdapter.list('accounts', { limit: 100 })).data || [];

  const assets = accounts.filter(a => a.type === 'Asset');
  const liabilities = accounts.filter(a => a.type === 'Liability');
  const equity = accounts.filter(a => a.type === 'Equity');
  const income = accounts.filter(a => a.type === 'Income');
  const expenses = accounts.filter(a => a.type === 'Expense');

  const totalAssets = assets.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const totalEquity = equity.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const totalIncome = income.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const totalExpenses = expenses.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>📊</span> Financial Statements & Balance Sheet
        </h1>
        <p class="text-xs text-slate-500 mt-1">GAAP/IndAS compliant statutory statements with automated P&L aggregation.</p>
      </div>
      <button type="button" onclick="window.print()" class="px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50">
        🖨️ Print Financial Statement
      </button>
    </div>

    <!-- P&L and Balance Sheet Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 printable-document">
      <!-- 1. Profit & Loss Statement -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Statement of Profit & Loss</h2>
          <p class="text-xs text-slate-400">For fiscal period ended today</p>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <div class="font-bold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wider text-[10px]">Operating Revenues</div>
            <ul class="space-y-1.5">
              ${income.map(i => `
                <li class="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>${escapeHTML(i.name)}</span>
                  <span class="font-mono">${formatCurrency(i.balance)}</span>
                </li>
              `).join('')}
            </ul>
            <div class="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Total Revenue</span>
              <span class="font-mono text-indigo-600 dark:text-indigo-400">${formatCurrency(totalIncome)}</span>
            </div>
          </div>

          <div>
            <div class="font-bold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wider text-[10px]">Operating Expenses</div>
            <ul class="space-y-1.5">
              ${expenses.map(e => `
                <li class="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>${escapeHTML(e.name)}</span>
                  <span class="font-mono">${formatCurrency(e.balance)}</span>
                </li>
              `).join('')}
            </ul>
            <div class="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Total Expenses</span>
              <span class="font-mono text-rose-600 dark:text-rose-400">${formatCurrency(totalExpenses)}</span>
            </div>
          </div>

          <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex justify-between items-center font-bold">
            <span class="text-emerald-800 dark:text-emerald-300">Net Operating Profit</span>
            <span class="font-mono text-emerald-800 dark:text-emerald-300 text-sm">${formatCurrency(netProfit)}</span>
          </div>
        </div>
      </div>

      <!-- 2. Balance Sheet -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Balance Sheet</h2>
          <p class="text-xs text-slate-400">Assets = Liabilities + Owner Equity</p>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <div class="font-bold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wider text-[10px]">Total Assets</div>
            <ul class="space-y-1.5">
              ${assets.map(a => `
                <li class="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>${escapeHTML(a.name)}</span>
                  <span class="font-mono">${formatCurrency(a.balance)}</span>
                </li>
              `).join('')}
            </ul>
            <div class="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Total Assets</span>
              <span class="font-mono text-indigo-600 dark:text-indigo-400">${formatCurrency(totalAssets)}</span>
            </div>
          </div>

          <div>
            <div class="font-bold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wider text-[10px]">Liabilities & Equity</div>
            <ul class="space-y-1.5">
              ${[...liabilities, ...equity].map(l => `
                <li class="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>${escapeHTML(l.name)}</span>
                  <span class="font-mono">${formatCurrency(l.balance)}</span>
                </li>
              `).join('')}
            </ul>
            <div class="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Total Liabilities & Equity</span>
              <span class="font-mono text-indigo-600 dark:text-indigo-400">${formatCurrency(totalLiabilities + totalEquity)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return container;
}

