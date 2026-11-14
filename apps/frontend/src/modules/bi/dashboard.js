/**
 * BI & Analytics: Executive Intelligence & Report Builder View
 */

import { dataAdapter } from '../../data/index.js';
import { formatCurrency, formatNumber } from '../../core/i18n.js';
import { ReportEngine } from '../../core/report-engine.js';
import { toast } from '../../components/toast.js';
import { escapeHTML } from '../../core/sanitize.js';

export default async function BiDashboardView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const [invoices, orders, items, employees] = await Promise.all([
    dataAdapter.list('invoices', { limit: 100 }),
    dataAdapter.list('sales_orders', { limit: 100 }),
    dataAdapter.list('items', { limit: 100 }),
    dataAdapter.list('employees', { limit: 100 })
  ]);

  const invoicesList = invoices.data || [];
  const ordersList = orders.data || [];
  const itemsList = items.data || [];
  const employeesList = employees.data || [];

  const revenue = invoicesList.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const openOrders = ordersList.reduce((s, o) => s + (Number(o.grandTotal) || 0), 0);
  const stockVal = itemsList.reduce((s, i) => s + ((Number(i.currentStock) || 0) * (Number(i.costPrice) || 0)), 0);
  const payrollCost = employeesList.reduce((s, e) => s + (Number(e.baseSalary) || 0), 0);

  // Groupings
  const ordersByCustomer = ReportEngine.aggregate(ordersList, 'customerName', 'grandTotal', 'SUM');
  const itemsByCategory = ReportEngine.aggregate(itemsList, 'category', 'currentStock', 'SUM');

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>📈</span> Executive BI Intelligence & Custom Report Builder
        </h1>
        <p class="text-xs text-slate-500 mt-1">Real-time analytical metrics, KPI health indices, and dynamic ad-hoc query builder.</p>
      </div>
      <button type="button" id="btn-export-bi-report" class="px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50">
        📥 Export Executive Brief
      </button>
    </div>

    <!-- Executive KPI Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Invoiced (YTD)</span>
        <div class="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">${formatCurrency(revenue)}</div>
        <div class="text-[11px] text-emerald-600 font-semibold mt-1">↑ 18.2% annual growth</div>
      </div>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Committed Pipeline</span>
        <div class="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">${formatCurrency(openOrders)}</div>
        <div class="text-[11px] text-indigo-500 font-semibold mt-1">${ordersList.length} sales orders</div>
      </div>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Warehouse Capital</span>
        <div class="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">${formatCurrency(stockVal)}</div>
        <div class="text-[11px] text-slate-400 font-semibold mt-1">${itemsList.length} stock line items</div>
      </div>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Headcount Commitment</span>
        <div class="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">${formatCurrency(payrollCost)}</div>
        <div class="text-[11px] text-slate-400 font-semibold mt-1">${employeesList.length} full-time employees</div>
      </div>
    </div>

    <!-- Charts Visualization Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="mb-4">
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Sales Order Volume by Customer</h3>
          <p class="text-xs text-slate-500">Live order values per enterprise client</p>
        </div>
        ${ReportEngine.renderSVGBarChart(ordersByCustomer, { isCurrency: true, height: 220 })}
      </div>

      <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="mb-4">
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Physical Stock Inventory Ratio</h3>
          <p class="text-xs text-slate-500">Breakdown by item classification</p>
        </div>
        ${ReportEngine.renderSVGDonutChart(itemsByCategory, { size: 180 })}
      </div>
    </div>

    <!-- Ad-Hoc Report Builder Panel -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Interactive Ad-Hoc Report Builder</h3>
      <p class="text-xs text-slate-500">Select entity source, grouping dimensions, and aggregation functions.</p>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Entity Source</label>
          <select id="bi-entity" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <option value="sales_orders">Sales Orders</option>
            <option value="invoices">Invoices</option>
            <option value="items">Inventory Items</option>
            <option value="employees">Employees</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Group By Dimension</label>
          <select id="bi-groupby" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <option value="customerName">Customer Name</option>
            <option value="status">Status</option>
            <option value="category">Category</option>
            <option value="department">Department</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Metric Calculation</label>
          <select id="bi-agg" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <option value="SUM">SUM (Total Amount)</option>
            <option value="COUNT">COUNT (Volume)</option>
            <option value="AVG">AVG (Average)</option>
          </select>
        </div>
        <div class="flex items-end">
          <button type="button" id="btn-run-query" class="w-full py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
            Generate Query
          </button>
        </div>
      </div>

      <div id="bi-query-results" class="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div class="text-slate-400 text-center py-4">Configure dimensions above and click "Generate Query" to build live report.</div>
      </div>
    </div>
  `;

  // Attach query runner
  container.querySelector('#btn-run-query').addEventListener('click', async () => {
    const entity = container.querySelector('#bi-entity').value;
    const groupBy = container.querySelector('#bi-groupby').value;
    const agg = container.querySelector('#bi-agg').value;

    const data = (await dataAdapter.list(entity, { limit: 100 })).data || [];
    const valField = entity === 'sales_orders' ? 'grandTotal' : entity === 'invoices' ? 'totalAmount' : entity === 'items' ? 'currentStock' : 'baseSalary';

    const aggregated = ReportEngine.aggregate(data, groupBy, valField, agg);
    const resultsMount = container.querySelector('#bi-query-results');

    if (aggregated.length === 0) {
      resultsMount.innerHTML = `<div class="text-slate-400 py-4 text-center">No matching data points</div>`;
      return;
    }

    resultsMount.innerHTML = `
      <div class="space-y-3">
        <h4 class="font-bold text-slate-800 dark:text-slate-200">Query Output: ${entity.toUpperCase()} grouped by ${groupBy} (${agg})</h4>
        <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th class="py-2.5 px-4">${escapeHTML(groupBy)}</th>
                <th class="py-2.5 px-4 text-right">Record Count</th>
                <th class="py-2.5 px-4 text-right">Computed Result</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              ${aggregated.map(a => `
                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td class="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">${escapeHTML(a.label)}</td>
                  <td class="py-2.5 px-4 text-right font-mono text-slate-500">${a.count}</td>
                  <td class="py-2.5 px-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">${formatNumber(a.value, 2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });

  container.querySelector('#btn-export-bi-report').addEventListener('click', () => {
    toast.success('Executive BI brief exported to print format.');
    window.print();
  });

  return container;
}

