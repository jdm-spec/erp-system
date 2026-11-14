/**
 * Enterprise Settings & Localization View
 */

import { store } from '../../../core/store.js';
import { i18n } from '../../../core/i18n.js';
import { localAdapter } from '../../../data/local-adapter.js';
import { toast } from '../../../components/toast.js';
import { escapeHTML, escapeAttr } from '../../../core/sanitize.js';

export default async function SettingsView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-4xl mx-auto space-y-6';

  const tenant = store.getState('tenant') || {};

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <span>⚙️</span> Enterprise Profile & Localization Settings
      </h1>
      <p class="text-xs text-slate-500 mt-1">Configure multi-currency, tax identifiers, fiscal calendars, and tenant branding.</p>
    </div>

    <form id="form-settings" class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Company Profile</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Display Brand Name</label>
            <input type="text" id="set-name" value="${escapeAttr(tenant.name || '')}" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Legal Registered Entity</label>
            <input type="text" id="set-legal-name" value="${escapeAttr(tenant.legalName || '')}" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">GSTIN / Tax Registration ID</label>
            <input type="text" id="set-tax-id" value="${escapeAttr(tenant.taxId || '')}" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Active Fiscal Period</label>
            <input type="text" id="set-fiscal-year" value="${escapeAttr(tenant.fiscalYear || '2026-2027')}" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
          </div>
        </div>
      </div>

      <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Localization & Currency</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Base Currency</label>
            <select id="set-currency" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <option value="INR" ${tenant.currency === 'INR' ? 'selected' : ''}>INR (₹) - Indian Rupee</option>
              <option value="USD" ${tenant.currency === 'USD' ? 'selected' : ''}>USD ($) - US Dollar</option>
              <option value="EUR" ${tenant.currency === 'EUR' ? 'selected' : ''}>EUR (€) - Euro</option>
              <option value="GBP" ${tenant.currency === 'GBP' ? 'selected' : ''}>GBP (£) - British Pound</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Date Format Mask</label>
            <select id="set-date-format" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Tax System Preset</label>
            <select id="set-tax-system" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <option value="GST">GST (CGST/SGST/IGST)</option>
              <option value="VAT">VAT</option>
              <option value="SALES_TAX">Sales Tax</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2">
        <button type="button" id="btn-reseed-data" class="px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100">
          🔄 Reload Clean Demo Data
        </button>
        <button type="submit" class="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">
          Save Settings
        </button>
      </div>
    </form>
  `;

  container.querySelector('#form-settings').addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedTenant = {
      ...tenant,
      name: container.querySelector('#set-name').value.trim(),
      legalName: container.querySelector('#set-legal-name').value.trim(),
      taxId: container.querySelector('#set-tax-id').value.trim(),
      fiscalYear: container.querySelector('#set-fiscal-year').value.trim(),
      currency: container.querySelector('#set-currency').value,
      currencySymbol: container.querySelector('#set-currency').value === 'INR' ? '₹' : '$',
      taxSystem: container.querySelector('#set-tax-system').value
    };

    store.setState({ tenant: updatedTenant });
    i18n.setSettings({
      currency: updatedTenant.currency,
      currencySymbol: updatedTenant.currencySymbol,
      dateFormat: container.querySelector('#set-date-format').value
    });

    toast.success('Enterprise settings updated successfully');
  });

  container.querySelector('#btn-reseed-data').addEventListener('click', () => {
    if (confirm('Reset database and restore realistic demo data across all 12 modules?')) {
      localAdapter.resetAllData();
      toast.success('Demo data restored! Refreshing view...');
      setTimeout(() => window.location.reload(), 600);
    }
  });

  return container;
}

