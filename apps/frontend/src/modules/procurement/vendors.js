/**
 * Procurement: Vendor Directory View
 */

import { dataAdapter } from '../../data/index.js';
import { escapeHTML } from '../../core/sanitize.js';
import { Modal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';

export default async function VendorsView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const vendors = (await dataAdapter.list('vendors', { limit: 100 })).data || [];

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>🤝</span> Approved Vendor & Supplier Directory
        </h1>
        <p class="text-xs text-slate-500 mt-1">Vendor performance scorecard, GSTIN compliance, and payment terms.</p>
      </div>
      <button type="button" id="btn-new-vendor" class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors">
        + Register New Vendor
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${vendors.map(v => `
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">${escapeHTML(v.name)}</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              ★ ${v.rating || 4.5}
            </span>
          </div>
          <div class="space-y-1 text-xs text-slate-500">
            <div><span class="font-medium text-slate-700 dark:text-slate-300">GSTIN:</span> <span class="font-mono">${escapeHTML(v.gstin || '-')}</span></div>
            <div><span class="font-medium text-slate-700 dark:text-slate-300">Terms:</span> ${escapeHTML(v.paymentTerms || 'Net 30')}</div>
            <div><span class="font-medium text-slate-700 dark:text-slate-300">Email:</span> ${escapeHTML(v.email || '-')}</div>
            <div><span class="font-medium text-slate-700 dark:text-slate-300">Phone:</span> ${escapeHTML(v.phone || '-')}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelector('#btn-new-vendor').addEventListener('click', () => {
    Modal.open({
      title: 'Register Supplier / Vendor',
      content: `
        <form id="form-vendor-modal" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold mb-1">Company Name</label>
            <input type="text" id="v-name" required placeholder="e.g. Apex Industrial Fasteners" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
          </div>
          <div>
            <label class="block font-semibold mb-1">GSTIN Number</label>
            <input type="text" id="v-gstin" required placeholder="27AAAAA0000A1Z5" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1">Payment Terms</label>
              <select id="v-terms" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30" selected>Net 30 Days</option>
                <option value="Net 45">Net 45 Days</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1">Contact Phone</label>
              <input type="text" id="v-phone" placeholder="+91 ..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
            </div>
          </div>
        </form>
      `,
      actions: [
        { label: 'Cancel', primary: false },
        {
          label: 'Register Vendor',
          primary: true,
          onClick: async (dialog) => {
            const name = dialog.querySelector('#v-name').value.trim();
            const gstin = dialog.querySelector('#v-gstin').value.trim();
            const paymentTerms = dialog.querySelector('#v-terms').value;
            const phone = dialog.querySelector('#v-phone').value.trim();

            if (!name || !gstin) {
              toast.error('Company Name and GSTIN are required');
              return false;
            }

            await dataAdapter.create('vendors', { name, gstin, paymentTerms, phone, rating: 5.0 });
            toast.success(`Vendor ${name} registered!`);
            window.location.reload();
            return true;
          }
        }
      ]
    });
  });

  return container;
}

