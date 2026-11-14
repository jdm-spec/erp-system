/**
 * Sales: Customer 360 View
 */

import { dataAdapter } from '../../data/index.js';
import { formatCurrency } from '../../core/i18n.js';
import { escapeHTML } from '../../core/sanitize.js';
import { Modal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';

export default async function CustomersView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const [custRes, ordersRes] = await Promise.all([
    dataAdapter.list('customers', { limit: 100 }),
    dataAdapter.list('sales_orders', { limit: 100 })
  ]);

  const customers = custRes.data || [];
  const orders = ordersRes.data || [];

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>🏢</span> Customer 360 & Commercial Accounts
        </h1>
        <p class="text-xs text-slate-500 mt-1">Unified client relationship, credit exposure, and sales order history.</p>
      </div>
      <button type="button" id="btn-new-customer" class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors">
        + Add Customer
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${customers.map(c => {
        const custOrders = orders.filter(o => o.customerId === c.id);
        const totalSales = custOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

        return `
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">${escapeHTML(c.name)}</h3>
                <span class="text-xs font-mono font-semibold text-slate-400">${escapeHTML(c.city || 'Mumbai')}</span>
              </div>

              <div class="space-y-1.5 text-xs text-slate-500">
                <div><span class="font-medium text-slate-700 dark:text-slate-300">GSTIN:</span> <span class="font-mono">${escapeHTML(c.gstin || '-')}</span></div>
                <div><span class="font-medium text-slate-700 dark:text-slate-300">Contact:</span> ${escapeHTML(c.contactPerson || '-')} (${escapeHTML(c.phone || '-')})</div>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                <div class="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span class="text-[10px] text-slate-400 block uppercase">Credit Limit</span>
                  <span class="font-mono font-bold text-slate-800 dark:text-slate-200">${formatCurrency(c.creditLimit)}</span>
                </div>
                <div class="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span class="text-[10px] text-slate-400 block uppercase">Outstanding</span>
                  <span class="font-mono font-bold text-amber-600">${formatCurrency(c.outstandingBalance)}</span>
                </div>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center">
              <span class="text-slate-400">${custOrders.length} Lifetime Orders</span>
              <span class="font-bold font-mono text-indigo-600 dark:text-indigo-400">${formatCurrency(totalSales)}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelector('#btn-new-customer').addEventListener('click', () => {
    Modal.open({
      title: 'Register Corporate Customer',
      content: `
        <form id="form-customer-modal" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold mb-1">Customer / Company Name</label>
            <input type="text" id="c-name" required placeholder="e.g. Godrej Industries Ltd" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
          </div>
          <div>
            <label class="block font-semibold mb-1">GSTIN</label>
            <input type="text" id="c-gstin" required placeholder="27AAAAA0000A1Z5" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">City</label>
              <input type="text" id="c-city" placeholder="Mumbai" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Approved Credit Limit (₹)</label>
              <input type="number" id="c-credit" value="2500000" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
            </div>
          </div>
          <div>
            <label class="block font-semibold mb-1">Key Contact Person</label>
            <input type="text" id="c-person" placeholder="Full Name" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
          </div>
        </form>
      `,
      actions: [
        { label: 'Cancel', primary: false },
        {
          label: 'Create Customer',
          primary: true,
          onClick: async (dialog) => {
            const name = dialog.querySelector('#c-name').value.trim();
            const gstin = dialog.querySelector('#c-gstin').value.trim();
            const city = dialog.querySelector('#c-city').value.trim();
            const creditLimit = Number(dialog.querySelector('#c-credit').value) || 0;
            const contactPerson = dialog.querySelector('#c-person').value.trim();

            if (!name) {
              toast.error('Customer Name is required');
              return false;
            }

            await dataAdapter.create('customers', {
              name, gstin, city, creditLimit, outstandingBalance: 0, contactPerson, phone: '+91 22 ...'
            });
            toast.success(`Customer ${name} added!`);
            window.location.reload();
            return true;
          }
        }
      ]
    });
  });

  return container;
}

