/**
 * Minimal & Elegant Schema-Driven Form Generation Engine
 * Mobile-First design: touch-friendly inputs, adaptive 1-to-N column layouts,
 * real-time formula computation, and conditional visibility.
 */

import { escapeHTML, escapeAttr } from './sanitize.js';
import { validateField, evaluateCondition } from './validators.js';
import { formatCurrency } from './i18n.js';
import { store } from './store.js';

export class FormEngine {
  /**
   * Renders a form component.
   * @param {object} params
   * @returns {HTMLElement} Form container element
   */
  static render({ schema, initialValues = {}, lookups = {}, readOnly = false, onSubmit, onCancel }) {
    const formValues = { ...initialValues };
    const container = document.createElement('div');
    container.className = 'erp-form-container bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-6 shadow-sm';

    // Apply default values from schema
    for (const field of schema.fields || []) {
      if (formValues[field.id] === undefined && field.defaultValue !== undefined) {
        if (field.defaultValue === '$TODAY') {
          formValues[field.id] = new Date().toISOString().split('T')[0];
        } else {
          formValues[field.id] = field.defaultValue;
        }
      }
    }

    const layout = schema.layout || {
      sections: [{ title: 'General', columns: 2, fields: (schema.fields || []).map(f => f.id) }]
    };

    let formHTML = `<form class="space-y-6" id="erp-dynamic-form" novalidate>`;

    for (const section of layout.sections || []) {
      formHTML += `
        <div class="border-b border-zinc-100 dark:border-zinc-800/60 pb-5 mb-5 last:border-b-0 last:pb-0 last:mb-0">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">${escapeHTML(section.title)}</h3>
          <div class="grid grid-cols-1 md:grid-cols-${section.columns || 2} gap-3 sm:gap-4">
      `;

      for (const fieldId of section.fields || []) {
        const fieldDef = (schema.fields || []).find(f => f.id === fieldId);
        if (!fieldDef) continue;

        formHTML += FormEngine.renderFieldMarkup(fieldDef, formValues[fieldId], lookups[fieldId] || fieldDef.options || [], readOnly);
      }

      formHTML += `
          </div>
        </div>
      `;
    }

    // Mobile-first action bar: full-width stacked on mobile, inline on desktop
    if (!readOnly) {
      formHTML += `
        <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
          <button type="button" id="btn-form-cancel" class="px-4 py-2.5 sm:py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 active:scale-95 transition-all text-center">
            Cancel
          </button>
          <button type="submit" id="btn-form-submit" class="px-5 py-2.5 sm:py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm text-center">
            Save Record
          </button>
        </div>
      `;
    }

    formHTML += `</form>`;
    container.innerHTML = formHTML;

    const formEl = container.querySelector('#erp-dynamic-form');

    const evaluateFormState = () => {
      const currentValues = FormEngine.collectFormValues(formEl, schema);

      // Formulas
      for (const field of schema.fields || []) {
        if (field.type === 'formula' && field.formula) {
          const computed = FormEngine.evaluateFormula(field.formula, currentValues);
          const inputEl = formEl.querySelector(`[name="${field.id}"]`);
          if (inputEl) {
            inputEl.value = field.format === 'currency' ? formatCurrency(computed) : computed;
          }
          currentValues[field.id] = computed;
        }
      }

      // Conditional visibility
      for (const field of schema.fields || []) {
        if (field.condition) {
          const wrapper = formEl.querySelector(`[data-field-wrapper="${field.id}"]`);
          if (wrapper) {
            const isVisible = evaluateCondition(field.condition, currentValues);
            wrapper.style.display = isVisible ? '' : 'none';
          }
        }
      }
    };

    formEl.addEventListener('input', () => {
      store.setDirty(true);
      evaluateFormState();
    });

    formEl.addEventListener('change', () => {
      store.setDirty(true);
      evaluateFormState();
    });

    setTimeout(evaluateFormState, 0);

    const cancelBtn = container.querySelector('#btn-form-cancel');
    if (cancelBtn && onCancel) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        store.setDirty(false);
        onCancel();
      });
    }

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const values = FormEngine.collectFormValues(formEl, schema);

      formEl.querySelectorAll('.erp-field-error').forEach(el => el.remove());
      formEl.querySelectorAll('.border-rose-500').forEach(el => el.classList.remove('border-rose-500'));

      let hasErrors = false;
      for (const field of schema.fields || []) {
        const err = validateField(values[field.id], field, values);
        if (err) {
          hasErrors = true;
          const inputEl = formEl.querySelector(`[name="${field.id}"]`);
          if (inputEl) {
            inputEl.classList.add('border-rose-500');
            const errP = document.createElement('p');
            errP.className = 'erp-field-error mt-1 text-[11px] text-rose-500';
            errP.textContent = err;
            inputEl.parentElement.appendChild(errP);
          }
        }
      }

      if (hasErrors) return;

      store.setDirty(false);
      if (onSubmit) onSubmit(values);
    });

    return container;
  }

  static renderFieldMarkup(field, value, options = [], readOnly = false) {
    const val = value !== undefined && value !== null ? value : '';
    const isReadOnly = readOnly || field.readOnly;
    const requiredBadge = field.required ? '<span class="text-rose-500 font-bold ml-0.5">*</span>' : '';
    const readOnlyAttr = isReadOnly ? 'readonly disabled' : '';

    const inputClasses = 'w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-60 transition-colors';

    let inputMarkup = '';

    switch (field.type) {
      case 'textarea':
        inputMarkup = `
          <textarea name="${escapeAttr(field.id)}" rows="${field.rows || 3}" ${readOnlyAttr} class="${inputClasses}">${escapeHTML(val)}</textarea>
        `;
        break;

      case 'select':
        inputMarkup = `
          <select name="${escapeAttr(field.id)}" ${readOnlyAttr} class="${inputClasses}">
            <option value="">Select an option</option>
            ${options.map(opt => {
              const optVal = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              const selected = String(optVal) === String(val) ? 'selected' : '';
              return `<option value="${escapeAttr(optVal)}" ${selected}>${escapeHTML(optLabel)}</option>`;
            }).join('')}
          </select>
        `;
        break;

      case 'checkbox':
        const checked = val ? 'checked' : '';
        inputMarkup = `
          <div class="flex items-center h-10">
            <input type="checkbox" name="${escapeAttr(field.id)}" ${checked} ${readOnlyAttr}
              class="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0 cursor-pointer" />
            <span class="ml-2.5 text-xs text-zinc-600 dark:text-zinc-400">${escapeHTML(field.description || 'Enable')}</span>
          </div>
        `;
        break;

      case 'date':
        inputMarkup = `
          <input type="date" name="${escapeAttr(field.id)}" value="${escapeAttr(val)}" ${readOnlyAttr} class="${inputClasses}" />
        `;
        break;

      case 'number':
      case 'currency':
        inputMarkup = `
          <div class="relative">
            ${field.type === 'currency' ? '<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 text-xs font-mono">₹</div>' : ''}
            <input type="number" step="${field.step || 'any'}" name="${escapeAttr(field.id)}" value="${escapeAttr(val)}" ${readOnlyAttr}
              class="${inputClasses} ${field.type === 'currency' ? 'pl-7 font-mono' : ''}" />
          </div>
        `;
        break;

      case 'formula':
        inputMarkup = `
          <input type="text" name="${escapeAttr(field.id)}" value="${escapeAttr(val)}" readonly disabled
            class="${inputClasses} bg-zinc-100/80 dark:bg-zinc-800/60 font-mono font-medium text-zinc-700 dark:text-zinc-300 cursor-not-allowed" />
        `;
        break;

      default:
        inputMarkup = `
          <input type="${escapeAttr(field.type || 'text')}" name="${escapeAttr(field.id)}" value="${escapeAttr(val)}" ${readOnlyAttr} class="${inputClasses}" />
        `;
        break;
    }

    return `
      <div data-field-wrapper="${escapeAttr(field.id)}" class="erp-field-group">
        <label class="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          ${escapeHTML(field.label || field.id)} ${requiredBadge}
        </label>
        ${inputMarkup}
      </div>
    `;
  }

  static collectFormValues(formEl, schema) {
    const values = {};
    const formData = new FormData(formEl);

    for (const field of schema.fields || []) {
      if (field.type === 'checkbox') {
        const cb = formEl.querySelector(`[name="${field.id}"]`);
        values[field.id] = cb ? cb.checked : false;
      } else if (field.type === 'number' || field.type === 'currency') {
        const val = formData.get(field.id);
        values[field.id] = val === '' || val === null ? null : Number(val);
      } else {
        values[field.id] = formData.get(field.id) ?? null;
      }
    }

    return values;
  }

  static evaluateFormula(formulaStr, values) {
    if (!formulaStr) return 0;
    try {
      let parsed = formulaStr;
      for (const [k, v] of Object.entries(values)) {
        const numVal = Number(v) || 0;
        const re = new RegExp(`\\b${k}\\b`, 'g');
        parsed = parsed.replace(re, String(numVal));
      }

      if (/^[0-9\.\s\+\-\*\/\(\)]+$/.test(parsed)) {
        return Function(`'use strict'; return (${parsed});`)() || 0;
      }
    } catch (e) {
      console.warn('Formula eval failed:', formulaStr, e);
    }
    return 0;
  }
}
