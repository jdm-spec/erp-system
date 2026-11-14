/**
 * Minimal & Elegant Executive Dashboard Overview
 * Mobile-First design: adaptive 1-2-4 column KPI cards, responsive SVG charts,
 * and high-contrast minimal enterprise layout.
 */

import { dataAdapter } from '../../../data/index.js';
import { formatCurrency, formatDate } from '../../../core/i18n.js';
import { ReportEngine } from '../../../core/report-engine.js';
import { escapeHTML } from '../../../core/sanitize.js';

export default async function DashboardOverview() {
  const container = document.createElement('div');
  container.className = 'p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6';

  const [invoicesRes, ordersRes, itemsRes, leadsRes, workOrdersRes] = await Promise.all([
    dataAdapter.list('invoices', { limit: 100 }),
    dataAdapter.list('sales_orders', { limit: 100 }),
    dataAdapter.list('items', { limit: 100 }),
    dataAdapter.list('leads', { limit: 100 }),
    dataAdapter.list('work_orders', { limit: 100 })
  ]);

  const invoices = invoicesRes.data || [];
  const orders = ordersRes.data || [];
  const items = itemsRes.data || [];
  const leads = leadsRes.data || [];
  const workOrders = workOrdersRes.data || [];

  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalOrdersValue = orders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  const totalStockValue = items.reduce((sum, itm) => sum + ((Number(itm.currentStock) || 0) * (Number(itm.costPrice) || 0)), 0);
  const openLeadsValue = leads.reduce((sum, l) => sum + (Number(l.potentialValue) || 0), 0);

  const revenueByCustomer = ReportEngine.aggregate(invoices, 'customerName', 'totalAmount', 'SUM');
  const stockByCategory = ReportEngine.aggregate(items, 'category', 'currentStock', 'SUM');

  container.innerHTML = `
    <!-- Top KPI Grid: Mobile 1-col, Tablet 2-col, Desktop 4-col -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white dark:bg-[#0D0D11] p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Invoiced Revenue</span>
          <div class="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">${formatCurrency(totalRevenue)}</div>
        </div>
        <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-3 flex items-center gap-1">
          <span>↑ 14.8%</span> <span class="text-zinc-400 text-[10px]">vs prior period</span>
        </div>
      </div>

      <div class="bg-white dark:bg-[#0D0D11] p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Committed Sales (SO)</span>
          <div class="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">${formatCurrency(totalOrdersValue)}</div>
        </div>
        <div class="text-[11px] text-zinc-500 mt-3 font-mono">
          ${orders.length} active orders
        </div>
      </div>

      <div class="bg-white dark:bg-[#0D0D11] p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Stock Valuation</span>
          <div class="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">${formatCurrency(totalStockValue)}</div>
        </div>
        <div class="text-[11px] text-zinc-500 mt-3 font-mono">
          ${items.length} managed SKUs
        </div>
      </div>

      <div class="bg-white dark:bg-[#0D0D11] p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Pipeline Pipeline</span>
          <div class="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">${formatCurrency(openLeadsValue)}</div>
        </div>
        <div class="text-[11px] text-zinc-500 mt-3 font-mono">
          ${leads.length} qualified prospects
        </div>
      </div>
    </div>

    <!-- Charts Row: Stacks vertically on mobile/tablet -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div class="lg:col-span-2 bg-white dark:bg-[#0D0D11] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Revenue Contribution by Account</h3>
            <p class="text-xs text-zinc-400">Total billings across major enterprise clients</p>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">Live</span>
        </div>
        <div class="overflow-x-auto">
          ${ReportEngine.renderSVGBarChart(revenueByCustomer, { isCurrency: true, height: 230 })}
        </div>
      </div>

      <div class="bg-white dark:bg-[#0D0D11] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
        <div class="mb-3">
          <h3 class="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Inventory Distribution</h3>
          <p class="text-xs text-zinc-400">Physical stock quantities by classification</p>
        </div>
        ${ReportEngine.renderSVGDonutChart(stockByCategory, { size: 190 })}
      </div>
    </div>

    <!-- Minimal Integration Status Strip -->
    <div class="bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            ● Active Integration Bus
          </span>
          <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1">Cross-Module Integration Orchestrator</h4>
          <p class="text-xs text-zinc-400 mt-0.5">Order-to-Cash, Procure-to-Pay, and Payroll-to-GL automated workflows.</p>
        </div>
        <div class="flex items-center gap-2">
          <a href="#/sales/orders" class="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-xl hover:opacity-90 active:scale-95 transition-all text-center">
            Test Sales Order
          </a>
          <a href="#/admin/studio" class="px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all text-center">
            Studio
          </a>
        </div>
      </div>
    </div>

    <!-- Recent Operations Grids -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div class="bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm p-5 sm:p-6">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Sales Orders</h3>
          <a href="#/sales/orders" class="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium">View all →</a>
        </div>
        <div class="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
          ${orders.slice(0, 4).map(o => `
            <div class="py-3 flex items-center justify-between gap-2">
              <div class="truncate">
                <span class="font-mono font-semibold text-zinc-900 dark:text-zinc-100">${escapeHTML(o.orderNumber)}</span>
                <span class="text-zinc-400 ml-2 truncate">${escapeHTML(o.customerName)}</span>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="font-mono font-medium">${formatCurrency(o.grandTotal)}</span>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">${escapeHTML(o.status)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm p-5 sm:p-6">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Production Work Orders</h3>
          <a href="#/manufacturing/work-orders" class="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium">View all →</a>
        </div>
        <div class="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
          ${workOrders.slice(0, 4).map(wo => `
            <div class="py-3 flex items-center justify-between gap-2">
              <div class="truncate">
                <span class="font-mono font-semibold text-zinc-900 dark:text-zinc-100">${escapeHTML(wo.orderNumber)}</span>
                <span class="text-zinc-400 ml-2 truncate">${escapeHTML(wo.itemName)}</span>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="font-mono text-zinc-500">${wo.produced} / ${wo.quantity}</span>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">${escapeHTML(wo.status)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  return container;
}
