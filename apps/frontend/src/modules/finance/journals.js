/**
 * Finance: Journal Entries View
 * Double-entry balanced book-keeping with debit/credit balance enforcement.
 */

import { dataAdapter } from '../../data/index.js';
import { formatCurrency, formatDate } from '../../core/i18n.js';
import { escapeHTML } from '../../core/sanitize.js';
import { Modal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';

export default async function JournalsView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const [journalsRes, accountsRes] = await Promise.all([
    dataAdapter.list('journal_entries', { limit: 100 }),
    dataAdapter.list('accounts', { limit: 100 })
  ]);

  const journals = journalsRes.data || [];
  const accounts = accountsRes.data || [];

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>📖</span> General Journal Entries
        </h1>
        <p class="text-xs text-slate-500 mt-1">Double-entry accounting journal postings with strict balance enforcement.</p>
      </div>
      <button type="button" id="btn-new-journal" class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors">
        + Post Journal Entry
      </button>
    </div>

    <div class="space-y-4">
      ${journals.map(j => `
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span class="font-bold text-sm text-slate-900 dark:text-slate-100">${escapeHTML(j.entryNumber)}</span>
              <span class="text-xs text-slate-400 ml-3">${formatDate(j.date)}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold uppercase">${escapeHTML(j.status || 'posted')}</span>
              <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">${formatCurrency(j.totalDebit)}</span>
            </div>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400">${escapeHTML(j.description)}</p>

          <table class="w-full text-xs text-left">
            <thead class="text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th class="py-1">Account</th>
                <th class="py-1 text-right">Debit</th>
                <th class="py-1 text-right">Credit</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/40">
              ${(j.lines || []).map(l => `
                <tr>
                  <td class="py-2 text-slate-700 dark:text-slate-300 font-medium">${escapeHTML(l.accountName)}</td>
                  <td class="py-2 text-right font-mono text-slate-900 dark:text-slate-100">${l.debit > 0 ? formatCurrency(l.debit) : '-'}</td>
                  <td class="py-2 text-right font-mono text-slate-900 dark:text-slate-100">${l.credit > 0 ? formatCurrency(l.credit) : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
    </div>
  `;

  // Attach New Journal Entry Modal
  container.querySelector('#btn-new-journal').addEventListener('click', () => {
    Modal.open({
      title: 'New Double-Entry Journal Voucher',
      size: 'lg',
      content: `
        <form id="form-journal-modal" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">Entry Date</label>
              <input type="date" id="je-date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Voucher Description</label>
              <input type="text" id="je-desc" placeholder="e.g. Utility electricity bill settlement" required class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
            </div>
          </div>

          <div class="border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 class="font-bold mb-2">Debit Leg</h4>
            <div class="grid grid-cols-2 gap-3">
              <select id="je-debit-acc" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                ${accounts.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join('')}
              </select>
              <input type="number" id="je-debit-amt" placeholder="Debit Amount (₹)" min="1" required class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
            </div>
          </div>

          <div class="border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 class="font-bold mb-2">Credit Leg</h4>
            <div class="grid grid-cols-2 gap-3">
              <select id="je-credit-acc" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                ${accounts.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join('')}
              </select>
              <input type="number" id="je-credit-amt" placeholder="Credit Amount (₹)" min="1" required class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
            </div>
          </div>
        </form>
      `,
      actions: [
        { label: 'Cancel', primary: false },
        {
          label: 'Post to General Ledger',
          primary: true,
          onClick: async (dialog) => {
            const date = dialog.querySelector('#je-date').value;
            const desc = dialog.querySelector('#je-desc').value.trim();
            const debitAccId = dialog.querySelector('#je-debit-acc').value;
            const debitAmt = Number(dialog.querySelector('#je-debit-amt').value) || 0;
            const creditAccId = dialog.querySelector('#je-credit-acc').value;
            const creditAmt = Number(dialog.querySelector('#je-credit-amt').value) || 0;

            if (debitAmt !== creditAmt || debitAmt <= 0) {
              toast.error('Double-entry validation failed: Total Debits must exactly equal Total Credits!');
              return false;
            }

            const debitAcc = accounts.find(a => a.id === debitAccId);
            const creditAcc = accounts.find(a => a.id === creditAccId);

            const newEntry = {
              id: `JE-2026-${Date.now().toString().slice(-4)}`,
              entryNumber: `JE-2026-${Date.now().toString().slice(-4)}`,
              date,
              description: desc,
              status: 'posted',
              totalDebit: debitAmt,
              totalCredit: creditAmt,
              lines: [
                { accountId: debitAccId, accountName: debitAcc?.name, debit: debitAmt, credit: 0 },
                { accountId: creditAccId, accountName: creditAcc?.name, debit: 0, credit: creditAmt }
              ]
            };

            await dataAdapter.create('journal_entries', newEntry);
            toast.success('Journal entry posted to General Ledger!');
            window.location.reload();
            return true;
          }
        }
      ]
    });
  });

  return container;
}

