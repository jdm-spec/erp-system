/**
 * Finance: Chart of Accounts View
 */

import { dataAdapter } from '../../data/index.js';
import { formatCurrency } from '../../core/i18n.js';
import { escapeHTML } from '../../core/sanitize.js';
import { Modal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';

export default async function AccountsView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const accounts = (await dataAdapter.list('accounts', { limit: 100 })).data || [];

  const categories = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>🏛️</span> General Ledger Chart of Accounts
        </h1>
        <p class="text-xs text-slate-500 mt-1">Double-entry accounting structure and account balances.</p>
      </div>
      <button type="button" id="btn-new-account" class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors">
        + Add GL Account
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${categories.map(cat => {
        const catAccounts = accounts.filter(a => a.type === cat);
        const total = catAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

        return `
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <span class="font-bold text-sm text-slate-900 dark:text-slate-100">${escapeHTML(cat)}s</span>
                <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">${formatCurrency(total)}</span>
              </div>
              <ul class="space-y-2 text-xs">
                ${catAccounts.map(a => `
                  <li class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <div>
                      <span class="font-mono text-slate-400 mr-1.5">[${escapeHTML(a.code)}]</span>
                      <span class="font-medium text-slate-700 dark:text-slate-300">${escapeHTML(a.name)}</span>
                    </div>
                    <span class="font-mono font-semibold">${formatCurrency(a.balance)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelector('#btn-new-account').addEventListener('click', () => {
    Modal.open({
      title: 'Create GL Account',
      content: `
        <form id="form-gl-account" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold mb-1">Account Code</label>
            <input type="text" id="acc-code" required placeholder="e.g. 1060" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono" />
          </div>
          <div>
            <label class="block font-semibold mb-1">Account Name</label>
            <input type="text" id="acc-name" required placeholder="e.g. ICICI Corporate Bank A/C" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
          </div>
          <div>
            <label class="block font-semibold mb-1">Account Type</label>
            <select id="acc-type" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <option value="Asset">Asset</option>
              <option value="Liability">Liability</option>
              <option value="Equity">Equity</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1">Opening Balance</label>
            <input type="number" id="acc-balance" value="0" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
          </div>
        </form>
      `,
      actions: [
        { label: 'Cancel', primary: false },
        {
          label: 'Create Account',
          primary: true,
          onClick: async (dialog) => {
            const code = dialog.querySelector('#acc-code').value.trim();
            const name = dialog.querySelector('#acc-name').value.trim();
            const type = dialog.querySelector('#acc-type').value;
            const balance = Number(dialog.querySelector('#acc-balance').value) || 0;

            if (!code || !name) {
              toast.error('Code and Name are required');
              return false;
            }

            await dataAdapter.create('accounts', { code, name, type, balance, currency: 'INR' });
            toast.success(`Account [${code}] ${name} created!`);
            window.location.reload();
            return true;
          }
        }
      ]
    });
  });

  return container;
}

