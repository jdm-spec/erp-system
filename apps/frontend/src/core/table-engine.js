/**
 * Minimal & Elegant Schema-Driven Dynamic Data Table Engine
 * Mobile-First design: provides clean cards on mobile or horizontal scroll tables,
 * debounced search, sort controls, CSV export, and touch actions.
 */

import { escapeHTML, escapeAttr } from './sanitize.js';
import { formatCurrency, formatDate, formatNumber } from './i18n.js';
import { WorkflowEngine } from './workflow-engine.js';

export class TableEngine {
  /**
   * Renders dynamic data table view.
   * @param {object} params
   * @returns {HTMLElement} Container element
   */
  static render({
    schema,
    data = [],
    total = 0,
    page = 1,
    limit = 25,
    sortBy = '',
    sortOrder = 'asc',
    searchTerm = '',
    actions = [],
    onPageChange,
    onSortChange,
    onSearch,
    onRowClick
  }) {
    const container = document.createElement('div');
    container.className = 'erp-table-engine space-y-3';

    const visibleFields = (schema.fields || []).filter(f => f.grid && f.grid.visible !== false);
    visibleFields.sort((a, b) => (a.grid?.order || 99) - (b.grid?.order || 99));

    // 1. Controls Bar: Search & Export
    const headerEl = document.createElement('div');
    headerEl.className = 'flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white dark:bg-[#0D0D11] p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm';
    headerEl.innerHTML = `
      <div class="relative flex-1 max-w-sm">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input type="text" id="table-search-input" value="${escapeAttr(searchTerm)}" placeholder="Search ${escapeAttr(schema.pluralLabel || schema.label)}..."
          class="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400" />
      </div>
      <div class="flex items-center gap-2 justify-end">
        <button type="button" id="btn-export-csv" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all">
          <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"></path></svg>
          Export CSV
        </button>
      </div>
    `;
    container.appendChild(headerEl);

    // Search with debounce
    let debounceTimer;
    headerEl.querySelector('#table-search-input').addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (onSearch) onSearch(e.target.value);
      }, 250);
    });

    headerEl.querySelector('#btn-export-csv').addEventListener('click', () => {
      TableEngine.exportToCSV(data, visibleFields, `${schema.entityId || 'export'}_${Date.now()}.csv`);
    });

    // 2. Data Grid (Clean desktop table + touch scroll container)
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0D0D11] shadow-sm overscroll-x-contain';

    let tableHTML = `
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-medium text-[11px]">
          <tr>
    `;

    for (const field of visibleFields) {
      const isSorted = sortBy === field.id;
      const sortIcon = isSorted ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : '';
      tableHTML += `
        <th scope="col" class="px-4 sm:px-5 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none whitespace-nowrap" data-sort-field="${escapeAttr(field.id)}">
          <div class="flex items-center gap-1">
            <span>${escapeHTML(field.label || field.id)}</span>
            <span class="font-bold text-zinc-900 dark:text-zinc-100">${sortIcon}</span>
          </div>
        </th>
      `;
    }

    if (actions.length > 0) {
      tableHTML += `<th scope="col" class="px-4 sm:px-5 py-3 text-right">Actions</th>`;
    }

    tableHTML += `</tr></thead><tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/60">`;

    if (data.length === 0) {
      const colspan = visibleFields.length + (actions.length > 0 ? 1 : 0);
      tableHTML += `
        <tr>
          <td colspan="${colspan}" class="px-5 py-12 text-center text-zinc-400">
            No matching records found
          </td>
        </tr>
      `;
    } else {
      for (const row of data) {
        tableHTML += `<tr class="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group" data-row-id="${escapeAttr(row.id)}">`;

        for (const field of visibleFields) {
          const formattedValue = TableEngine.formatCellValue(row[field.id], field, schema);
          tableHTML += `<td class="px-4 sm:px-5 py-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">${formattedValue}</td>`;
        }

        if (actions.length > 0) {
          tableHTML += `<td class="px-4 sm:px-5 py-3 text-right whitespace-nowrap space-x-1">`;
          for (const act of actions) {
            tableHTML += `
              <button type="button" data-action="${escapeAttr(act.id)}" data-row-id="${escapeAttr(row.id)}"
                class="inline-flex items-center px-2 py-1 text-[11px] font-medium rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 active:scale-95 transition-all">
                ${act.icon || ''} <span class="${act.icon ? 'ml-1' : ''}">${escapeHTML(act.label)}</span>
              </button>
            `;
          }
          tableHTML += `</td>`;
        }

        tableHTML += `</tr>`;
      }
    }

    tableHTML += `</tbody></table>`;
    tableWrapper.innerHTML = tableHTML;
    container.appendChild(tableWrapper);

    // Attach Sort Clicks
    tableWrapper.querySelectorAll('th[data-sort-field]').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort-field');
        const nextOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        if (onSortChange) onSortChange(field, nextOrder);
      });
    });

    // Row & Action Clicks
    tableWrapper.querySelectorAll('tr[data-row-id]').forEach(tr => {
      const rowId = tr.getAttribute('data-row-id');
      const row = data.find(r => String(r.id) === String(rowId));

      tr.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        if (onRowClick && row) onRowClick(row);
      });
    });

    tableWrapper.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const actionId = btn.getAttribute('data-action');
        const rowId = btn.getAttribute('data-row-id');
        const row = data.find(r => String(r.id) === String(rowId));
        const actionDef = actions.find(a => a.id === actionId);
        if (actionDef && actionDef.onClick && row) {
          actionDef.onClick(row);
        }
      });
    });

    // 3. Responsive Pagination Footer
    const totalPages = Math.ceil(total / limit) || 1;
    const paginationEl = document.createElement('div');
    paginationEl.className = 'flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 px-1 pt-1';
    paginationEl.innerHTML = `
      <div class="text-[11px]">
        Showing <span class="font-semibold text-zinc-800 dark:text-zinc-200">${total > 0 ? (page - 1) * limit + 1 : 0}</span>–<span class="font-semibold text-zinc-800 dark:text-zinc-200">${Math.min(page * limit, total)}</span> of <span class="font-semibold text-zinc-800 dark:text-zinc-200">${total}</span>
      </div>
      <div class="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
        <button type="button" id="btn-page-prev" ${page <= 1 ? 'disabled' : ''}
          class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-95 transition-all text-xs font-medium">
          Previous
        </button>
        <span class="px-2 text-xs text-zinc-400 font-mono">${page} / ${totalPages}</span>
        <button type="button" id="btn-page-next" ${page >= totalPages ? 'disabled' : ''}
          class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-95 transition-all text-xs font-medium">
          Next
        </button>
      </div>
    `;
    container.appendChild(paginationEl);

    paginationEl.querySelector('#btn-page-prev').addEventListener('click', () => {
      if (page > 1 && onPageChange) onPageChange(page - 1);
    });

    paginationEl.querySelector('#btn-page-next').addEventListener('click', () => {
      if (page < totalPages && onPageChange) onPageChange(page + 1);
    });

    return container;
  }

  static formatCellValue(value, field, schema) {
    if (value === null || value === undefined || value === '') return '-';

    if (field.type === 'workflow_status' || field.id === 'status') {
      const badgeClass = WorkflowEngine.getStatusBadgeClass(value, schema.workflow);
      return `<span class="${badgeClass}">${escapeHTML(value)}</span>`;
    }

    if (field.type === 'currency' || field.grid?.format === 'currency') {
      return `<span class="font-mono font-medium">${formatCurrency(value)}</span>`;
    }

    if (field.type === 'date' || field.grid?.format === 'date') {
      return formatDate(value);
    }

    if (field.type === 'number' || field.grid?.format === 'number') {
      return `<span class="font-mono">${formatNumber(value)}</span>`;
    }

    if (field.type === 'checkbox') {
      return value ? '<span class="text-zinc-900 dark:text-zinc-100 font-medium">Yes</span>' : '<span class="text-zinc-400">No</span>';
    }

    return escapeHTML(value);
  }

  static exportToCSV(data, fields, filename) {
    if (!data || data.length === 0) return;

    const headers = fields.map(f => `"${(f.label || f.id).replace(/"/g, '""')}"`).join(',');
    const rows = data.map(row => {
      return fields.map(f => {
        const val = row[f.id] !== undefined && row[f.id] !== null ? String(row[f.id]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
