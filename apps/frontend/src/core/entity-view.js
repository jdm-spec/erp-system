/**
 * Minimal & Elegant Universal Entity View Controller
 * Mobile-First design: responsive header, touch-friendly creation triggers,
 * and seamless mobile drawer / bottom sheet integration.
 */

import { configEngine } from './config-engine.js';
import { dataAdapter } from '../data/index.js';
import { TableEngine } from './table-engine.js';
import { FormEngine } from './form-engine.js';
import { WorkflowEngine } from './workflow-engine.js';
import { Modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { auth } from './auth.js';
import { rbac } from './rbac.js';
import { escapeHTML } from './sanitize.js';

export class EntityView {
  /**
   * Generates a complete entity view with table, create modal, edit modal, and workflow buttons.
   */
  static async create({ entityKey, tableName, title, subtitle, customActions = [] }) {
    const container = document.createElement('div');
    container.className = 'p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6';

    let currentPage = 1;
    let currentLimit = 25;
    let currentSortBy = '';
    let currentSortOrder = 'asc';
    let currentSearch = '';

    const schema = configEngine.getSchema(entityKey);
    const user = auth.getCurrentUser();

    // 1. Header Banner
    const headerEl = document.createElement('div');
    headerEl.className = 'bg-white dark:bg-[#0D0D11] p-4 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4';
    headerEl.innerHTML = `
      <div>
        <h1 class="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>${escapeHTML(title || schema.pluralLabel || schema.label)}</span>
        </h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">${escapeHTML(subtitle || `Manage, track, and automate ${schema.pluralLabel || schema.label}.`)}</p>
      </div>
      <div>
        <button type="button" id="btn-create-record" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path></svg>
          New ${escapeHTML(schema.label)}
        </button>
      </div>
    `;
    container.appendChild(headerEl);

    // Table mount point
    const tableMount = document.createElement('div');
    container.appendChild(tableMount);

    const refreshTable = async () => {
      const result = await dataAdapter.list(tableName, {
        page: currentPage,
        limit: currentLimit,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
        search: currentSearch
      });

      tableMount.innerHTML = '';

      const actions = [
        {
          id: 'view',
          label: 'Open',
          onClick: (record) => openRecordModal(record)
        },
        ...customActions
      ];

      if (rbac.hasPermission(user, schema.permissions?.delete || `${entityKey}.delete`)) {
        actions.push({
          id: 'delete',
          label: 'Delete',
          onClick: async (record) => {
            if (confirm(`Are you sure you want to delete ${record[schema.titleField] || record.id}?`)) {
              await dataAdapter.remove(tableName, record.id);
              toast.success('Record deleted.');
              refreshTable();
            }
          }
        });
      }

      const tableEl = TableEngine.render({
        schema,
        data: result.data || [],
        total: result.total || 0,
        page: currentPage,
        limit: currentLimit,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
        searchTerm: currentSearch,
        actions,
        onPageChange: (newPage) => {
          currentPage = newPage;
          refreshTable();
        },
        onSortChange: (field, order) => {
          currentSortBy = field;
          currentSortOrder = order;
          refreshTable();
        },
        onSearch: (term) => {
          currentSearch = term;
          currentPage = 1;
          refreshTable();
        },
        onRowClick: (record) => openRecordModal(record)
      });

      tableMount.appendChild(tableEl);
    };

    const openRecordModal = (record = null) => {
      const isNew = !record;
      const modalTitle = isNew ? `New ${schema.label}` : `${schema.label}: ${record[schema.titleField] || record.id}`;

      let modalInstance = null;

      const modalContainer = document.createElement('div');
      modalContainer.className = 'space-y-4';

      // Workflow transition buttons
      if (!isNew && schema.workflow) {
        const availableTransitions = WorkflowEngine.getAvailableTransitions(record, schema.workflow, user);

        if (availableTransitions.length > 0) {
          const workflowBar = document.createElement('div');
          workflowBar.className = 'flex flex-wrap items-center gap-1.5 p-2.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800';
          workflowBar.innerHTML = `<span class="text-[11px] font-medium text-zinc-400 mr-1.5">Action:</span>`;

          for (const trans of availableTransitions) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'px-3 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 rounded-lg active:scale-95 transition-all shadow-sm';
            btn.textContent = trans.label;

            btn.addEventListener('click', async () => {
              try {
                const updated = await WorkflowEngine.executeTransition({
                  entity: tableName,
                  record,
                  transition: trans,
                  dataAdapter,
                  currentUser: user
                });
                toast.success(`Status updated to: ${trans.to.toUpperCase()}`);
                modalInstance?.close();
                refreshTable();
              } catch (e) {
                toast.error(`Transition error: ${e.message}`);
              }
            });

            workflowBar.appendChild(btn);
          }
          modalContainer.appendChild(workflowBar);
        }
      }

      const formEl = FormEngine.render({
        schema,
        initialValues: record || {},
        onSubmit: async (values) => {
          try {
            if (isNew) {
              if (schema.numbering && !values[schema.titleField]) {
                const pad = schema.numbering.padLength || 4;
                const randNum = Math.floor(100 + Math.random() * 900);
                values[schema.titleField] = `${schema.numbering.prefix}${'0'.repeat(pad - 3)}${randNum}`;
              }

              await dataAdapter.create(tableName, values);
              toast.success(`New ${schema.label} created!`);
            } else {
              await dataAdapter.update(tableName, record.id, values);
              toast.success(`${schema.label} updated!`);
            }
            modalInstance?.close();
            refreshTable();
          } catch (e) {
            toast.error(`Save failed: ${e.message}`);
          }
        },
        onCancel: () => {
          modalInstance?.close();
        }
      });

      modalContainer.appendChild(formEl);

      modalInstance = Modal.open({
        title: modalTitle,
        content: modalContainer,
        size: 'xl'
      });
    };

    headerEl.querySelector('#btn-create-record').addEventListener('click', () => {
      openRecordModal(null);
    });

    await refreshTable();
    return container;
  }
}
