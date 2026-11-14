/**
 * Minimal & Elegant Customization Studio View
 * Zero-code schema builder, custom field manager, document numbering,
 * and persistent module lifecycle toggles.
 */

import { configEngine } from '../../../core/config-engine.js';
import { store } from '../../../core/store.js';
import { toast } from '../../../components/toast.js';
import { Modal } from '../../../components/modal.js';
import { escapeHTML, escapeAttr } from '../../../core/sanitize.js';

export default async function StudioView({ router }) {
  const container = document.createElement('div');
  container.className = 'p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6';

  const enabledModules = store.getState('enabledModules') || {};

  container.innerHTML = `
    <!-- Studio Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0D0D11] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
      <div>
        <h1 class="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>Customization Studio</span>
        </h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Zero-code schema customizer, dynamic custom fields, document numbering, and module toggles.
        </p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button type="button" id="btn-export-config" class="px-3 py-1.5 text-xs font-medium bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all">
          Export Config
        </button>
        <button type="button" id="btn-import-config" class="px-3 py-1.5 text-xs font-medium bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all">
          Import Config
        </button>
        <button type="button" id="btn-reset-config" class="px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400 rounded-xl hover:bg-rose-100 active:scale-95 transition-all">
          Reset Defaults
        </button>
      </div>
    </div>

    <!-- Minimal Elegant Tabs Bar -->
    <div class="border-b border-zinc-200/80 dark:border-zinc-800 flex gap-4 sm:gap-6 text-xs sm:text-sm font-medium overflow-x-auto select-none">
      <button type="button" data-tab="modules" class="tab-btn pb-3 border-b-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-zinc-100 font-semibold whitespace-nowrap">
        1. Module Lifecycle
      </button>
      <button type="button" data-tab="fields" class="tab-btn pb-3 border-b-2 border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 whitespace-nowrap">
        2. Custom Fields & Rules
      </button>
      <button type="button" data-tab="numbering" class="tab-btn pb-3 border-b-2 border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 whitespace-nowrap">
        3. Numbering Series
      </button>
      <button type="button" data-tab="history" class="tab-btn pb-3 border-b-2 border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 whitespace-nowrap">
        4. Revision History
      </button>
    </div>

    <!-- TAB 1: Module Toggles -->
    <div id="tab-content-modules" class="tab-pane space-y-4">
      <div class="bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm">
        <div class="mb-5">
          <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Activate or Deactivate Business Modules</h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Toggling updates the navigation hierarchy and secures corresponding routes immediately.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" id="module-toggles-grid">
          ${[
            { id: 'finance', name: 'Finance & Accounting', desc: 'General ledger, invoices, payments, P&L' },
            { id: 'inventory', name: 'Inventory & Warehousing', desc: 'Item catalog, stock valuation, bins' },
            { id: 'procurement', name: 'Procurement (P2P)', desc: 'Vendor orders, 3-way matching' },
            { id: 'sales', name: 'Sales & Distribution (O2C)', desc: 'Quotations, sales orders, customer 360' },
            { id: 'crm', name: 'CRM & Pipeline', desc: 'Leads, deals, SLA support tickets' },
            { id: 'hrms', name: 'HRMS & Payroll', desc: 'Staff register, salary processing, leaves' },
            { id: 'manufacturing', name: 'Manufacturing & MRP', desc: 'Work orders, multi-level BOMs' },
            { id: 'scm', name: 'Supply Chain & Logistics', desc: 'Shipments, waybills, demand forecasting' },
            { id: 'projects', name: 'Project Management', desc: 'Capex budgets, milestones, progress' },
            { id: 'quality', name: 'Quality Management', desc: 'Inspection plans, lot audits, defects' },
            { id: 'assets', name: 'Asset Maintenance', desc: 'Machinery register, preventive service' },
            { id: 'bi', name: 'BI & Executive Analytics', desc: 'KPI cards, custom report builder' }
          ].map(m => {
            const isEnabled = enabledModules[m.id] !== false;
            return `
              <div class="module-card p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 flex items-center justify-between gap-3 transition-colors">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">${escapeHTML(m.name)}</span>
                  </div>
                  <div class="text-[11px] text-zinc-400 truncate mt-0.5">${escapeHTML(m.desc)}</div>
                </div>

                <!-- Functional Interactive Toggle Button -->
                <button type="button" role="switch" aria-label="Toggle ${escapeAttr(m.name)}"
                  data-mod-id="${m.id}" data-mod-name="${escapeAttr(m.name)}" data-mod-enabled="${isEnabled ? 'true' : 'false'}"
                  class="toggle-switch-btn relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isEnabled ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'}">
                  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'}"></span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- TAB 2: Custom Fields & Rules -->
    <div id="tab-content-fields" class="tab-pane hidden space-y-4">
      <div class="bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Schema Entity Inspector & Custom Fields</h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Attach custom fields to any entity at runtime without editing code.</p>
          </div>
          <div class="flex items-center gap-2">
            <select id="select-entity-inspect" class="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-medium text-zinc-800 dark:text-zinc-200">
              <option value="sales_order">Sales Order (sales_order)</option>
              <option value="purchase_order">Purchase Order (purchase_order)</option>
              <option value="invoice">Invoice (invoice)</option>
              <option value="item">Inventory Item (item)</option>
              <option value="employee">Employee (employee)</option>
              <option value="lead">CRM Lead (lead)</option>
              <option value="work_order">Work Order (work_order)</option>
              <option value="shipment">Shipment (shipment)</option>
              <option value="project">Project (project)</option>
              <option value="inspection">Quality Inspection (inspection)</option>
              <option value="asset">Fixed Asset (asset)</option>
            </select>
            <button type="button" id="btn-add-custom-field" class="px-3.5 py-2 text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm">
              + Add Field
            </button>
          </div>
        </div>

        <div id="entity-fields-container" class="overflow-x-auto"></div>
      </div>
    </div>

    <!-- TAB 3: Document Numbering -->
    <div id="tab-content-numbering" class="tab-pane hidden space-y-4">
      <div class="bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm">
        <div class="mb-5">
          <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Document Numbering Series</h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Configure prefixes and sequential padding for documents.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" id="numbering-series-list"></div>
      </div>
    </div>

    <!-- TAB 4: History -->
    <div id="tab-content-history" class="tab-pane hidden space-y-4">
      <div class="bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm">
        <div class="mb-4">
          <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Customization Audit Trail</h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Chronological record of runtime schema updates.</p>
        </div>
        <div id="history-container" class="space-y-2 text-xs"></div>
      </div>
    </div>
  `;

  // 1. Attach Functional Interactive Module Toggles
  container.querySelectorAll('.toggle-switch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modId = btn.getAttribute('data-mod-id');
      const modName = btn.getAttribute('data-mod-name') || modId;
      const isCurrentlyEnabled = btn.getAttribute('data-mod-enabled') === 'true';
      const nextState = !isCurrentlyEnabled;

      // Update button visual state immediately
      btn.setAttribute('data-mod-enabled', nextState ? 'true' : 'false');
      btn.setAttribute('aria-checked', nextState ? 'true' : 'false');

      const knob = btn.querySelector('span');
      if (nextState) {
        btn.className = 'toggle-switch-btn relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-zinc-900 dark:bg-white';
        knob.className = 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out translate-x-5';
      } else {
        btn.className = 'toggle-switch-btn relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-zinc-300 dark:bg-zinc-700';
        knob.className = 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-md ring-0 transition duration-200 ease-in-out translate-x-0';
      }

      // Update global store (which persists to localStorage & updates sidebar)
      const current = store.getState('enabledModules') || {};
      store.setState({
        enabledModules: { ...current, [modId]: nextState }
      });

      toast.success(`${modName} ${nextState ? 'enabled' : 'deactivated'}.`);
    });
  });

  // 2. Attach Tab Navigation
  const tabBtns = container.querySelectorAll('.tab-btn');
  const tabPanes = container.querySelectorAll('.tab-pane');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => {
        b.classList.remove('border-zinc-900', 'dark:border-white', 'text-zinc-900', 'dark:text-zinc-100', 'font-semibold');
        b.classList.add('border-transparent', 'text-zinc-400');
      });
      btn.classList.add('border-zinc-900', 'dark:border-white', 'text-zinc-900', 'dark:text-zinc-100', 'font-semibold');
      btn.classList.remove('border-transparent', 'text-zinc-400');

      tabPanes.forEach(pane => pane.classList.add('hidden'));
      container.querySelector(`#tab-content-${target}`)?.classList.remove('hidden');

      if (target === 'fields') renderEntityFields();
      if (target === 'numbering') renderNumberingSeries();
      if (target === 'history') renderHistory();
    });
  });

  // 3. Render Fields
  const selectEntity = container.querySelector('#select-entity-inspect');
  const fieldsContainer = container.querySelector('#entity-fields-container');

  const renderEntityFields = () => {
    const entityKey = selectEntity.value;
    const schema = configEngine.getSchema(entityKey);

    let html = `
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-medium text-[11px]">
          <tr>
            <th class="py-2.5 px-4">Field ID</th>
            <th class="py-2.5 px-4">Display Label</th>
            <th class="py-2.5 px-4">Type</th>
            <th class="py-2.5 px-4">Required</th>
            <th class="py-2.5 px-4">Grid Visible</th>
            <th class="py-2.5 px-4">Origin</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/60">
    `;

    for (const f of schema.fields || []) {
      const isCustomBadge = f.isCustom
        ? `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">Custom</span>`
        : `<span class="px-2 py-0.5 rounded text-[10px] text-zinc-400">Core</span>`;

      html += `
        <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
          <td class="py-2.5 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">${escapeHTML(f.id)}</td>
          <td class="py-2.5 px-4 font-medium text-zinc-700 dark:text-zinc-300">${escapeHTML(f.label)}</td>
          <td class="py-2.5 px-4 font-mono text-zinc-400">${escapeHTML(f.type)}</td>
          <td class="py-2.5 px-4">${f.required ? '<span class="text-rose-500 font-bold">Yes</span>' : '<span class="text-zinc-400">No</span>'}</td>
          <td class="py-2.5 px-4">${f.grid?.visible !== false ? '✓' : '-'}</td>
          <td class="py-2.5 px-4">${isCustomBadge}</td>
        </tr>
      `;
    }

    html += `</tbody></table>`;
    fieldsContainer.innerHTML = html;
  };

  selectEntity.addEventListener('change', renderEntityFields);

  // 4. Custom Field Modal
  container.querySelector('#btn-add-custom-field').addEventListener('click', () => {
    const entityKey = selectEntity.value;

    const modalContent = `
      <form id="form-custom-field-modal" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-medium mb-1 text-zinc-600 dark:text-zinc-400">Field Label</label>
          <input type="text" id="cf-label" required placeholder="e.g. Warranty Coverage (Months)"
            class="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
        </div>
        <div>
          <label class="block font-medium mb-1 text-zinc-600 dark:text-zinc-400">Field ID (Unique Key)</label>
          <input type="text" id="cf-id" required placeholder="e.g. warrantyCoverage"
            class="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-medium mb-1 text-zinc-600 dark:text-zinc-400">Data Type</label>
            <select id="cf-type" class="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-sm">
              <option value="text">Text (Single Line)</option>
              <option value="number">Numeric</option>
              <option value="currency">Currency (₹ / $)</option>
              <option value="date">Date Picker</option>
              <option value="select">Dropdown Select</option>
              <option value="checkbox">Boolean Checkbox</option>
              <option value="textarea">Multi-line Text</option>
            </select>
          </div>
          <div>
            <label class="block font-medium mb-1 text-zinc-600 dark:text-zinc-400">Options (Comma-separated)</label>
            <input type="text" id="cf-options" placeholder="Standard, Extended"
              class="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-sm" />
          </div>
        </div>
        <div class="flex items-center gap-4 pt-1">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="cf-required" class="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0" />
            <span class="text-zinc-700 dark:text-zinc-300">Required Field</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="cf-grid-visible" checked class="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0" />
            <span class="text-zinc-700 dark:text-zinc-300">Show in Table Grid</span>
          </label>
        </div>
      </form>
    `;

    Modal.open({
      title: `Add Custom Field to ${entityKey}`,
      content: modalContent,
      actions: [
        { label: 'Cancel', primary: false },
        {
          label: 'Save Field',
          primary: true,
          onClick: (dialog) => {
            const label = dialog.querySelector('#cf-label').value.trim();
            const id = dialog.querySelector('#cf-id').value.trim();
            const type = dialog.querySelector('#cf-type').value;
            const optionsStr = dialog.querySelector('#cf-options').value.trim();
            const required = dialog.querySelector('#cf-required').checked;
            const gridVisible = dialog.querySelector('#cf-grid-visible').checked;

            if (!label || !id) {
              toast.error('Field Label and ID are required');
              return false;
            }

            const fieldDef = {
              id,
              label,
              type,
              required,
              grid: { visible: gridVisible, order: 90 }
            };

            if (type === 'select' && optionsStr) {
              fieldDef.options = optionsStr.split(',').map(s => s.trim()).filter(Boolean);
            }

            configEngine.addCustomField(entityKey, fieldDef);
            toast.success(`Custom field "${label}" added to ${entityKey}!`);
            renderEntityFields();
            return true;
          }
        }
      ]
    });
  });

  // 5. Render Numbering Series
  const renderNumberingSeries = () => {
    const numberingList = container.querySelector('#numbering-series-list');
    const entities = ['sales_order', 'purchase_order', 'invoice', 'item', 'employee', 'work_order', 'shipment', 'inspection'];

    numberingList.innerHTML = entities.map(e => {
      const s = configEngine.getSchema(e);
      const prefix = s.numbering?.prefix || `${e.slice(0, 3).toUpperCase()}-`;
      const pad = s.numbering?.padLength || 4;

      return `
        <div class="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-xs text-zinc-900 dark:text-zinc-100">${escapeHTML(s.label || e)}</span>
            <span class="font-mono text-xs text-zinc-500 font-medium">${prefix}${'0'.repeat(pad - 1)}1</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label class="block text-[10px] text-zinc-400 mb-1">Prefix</label>
              <input type="text" data-num-prefix="${e}" value="${escapeAttr(prefix)}" class="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs" />
            </div>
            <div>
              <label class="block text-[10px] text-zinc-400 mb-1">Padding</label>
              <input type="number" min="2" max="8" data-num-pad="${e}" value="${pad}" class="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs" />
            </div>
          </div>
          <button type="button" data-save-num="${e}" class="w-full py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-95 transition-all text-center">
            Save Series
          </button>
        </div>
      `;
    }).join('');

    numberingList.querySelectorAll('[data-save-num]').forEach(btn => {
      btn.addEventListener('click', () => {
        const entityKey = btn.getAttribute('data-save-num');
        const prefix = numberingList.querySelector(`[data-num-prefix="${entityKey}"]`).value;
        const padLength = Number(numberingList.querySelector(`[data-num-pad="${entityKey}"]`).value) || 4;

        configEngine.saveSchemaCustomization(entityKey, {
          numbering: { prefix, padLength }
        }, `Updated numbering for ${entityKey}`);

        toast.success(`Numbering updated for ${entityKey}`);
        renderNumberingSeries();
      });
    });
  };

  // 6. Render History
  const renderHistory = () => {
    const histEl = container.querySelector('#history-container');
    const history = configEngine.getHistory();

    if (history.length === 0) {
      histEl.innerHTML = `<div class="text-zinc-400 py-4 text-center">No customizations recorded yet.</div>`;
      return;
    }

    histEl.innerHTML = history.map(h => `
      <div class="flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div>
          <span class="font-medium text-zinc-900 dark:text-zinc-100">${escapeHTML(h.reason || 'Customization')}</span>
          <span class="text-zinc-400 font-mono text-[10px] ml-2">[${escapeHTML(h.entityKey)}]</span>
        </div>
        <div class="text-[10px] text-zinc-400 font-mono">${new Date(h.timestamp).toLocaleString()}</div>
      </div>
    `).join('');
  };

  // 7. Config Action Buttons
  container.querySelector('#btn-export-config').addEventListener('click', () => {
    const jsonStr = configEngine.exportConfigJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erp_config_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exported successfully');
  });

  container.querySelector('#btn-import-config').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = configEngine.importConfigJSON(event.target.result);
        if (res.success) {
          toast.success('Configuration imported and applied!');
          renderEntityFields();
        } else {
          toast.error(`Import error: ${res.error}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  container.querySelector('#btn-reset-config').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all schema customizations to factory defaults?')) {
      configEngine.resetToDefaults();
      toast.success('All customizations reset to defaults.');
      renderEntityFields();
      renderNumberingSeries();
    }
  });

  return container;
}
