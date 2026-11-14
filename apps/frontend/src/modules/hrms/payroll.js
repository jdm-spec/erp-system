/**
 * HRMS: Payroll Processing View
 * Calculates gross compensation, statutory deductions, net disbursements,
 * and posts double-entry general ledger journal entries into Finance.
 */

import { dataAdapter } from '../../data/index.js';
import { formatCurrency } from '../../core/i18n.js';
import { events } from '../../core/events.js';
import { toast } from '../../components/toast.js';
import { escapeHTML } from '../../core/sanitize.js';

export default async function PayrollView() {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-7xl mx-auto space-y-6';

  const [payrollsRes, employeesRes] = await Promise.all([
    dataAdapter.list('payrolls', { limit: 50 }),
    dataAdapter.list('employees', { limit: 100 })
  ]);

  const payrolls = payrollsRes.data || [];
  const employees = employeesRes.data || [];

  const totalMonthlyGross = employees.reduce((sum, e) => sum + (Number(e.baseSalary) || 0), 0);

  container.innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>👥</span> Monthly Payroll Engine & General Ledger Sync
        </h1>
        <p class="text-xs text-slate-500 mt-1">Salary structures, PF/TDS deductions, and automated GL voucher posting.</p>
      </div>
      <button type="button" id="btn-run-payroll" class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors">
        ⚡ Run March 2026 Payroll
      </button>
    </div>

    <!-- Active Payroll Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span class="text-xs font-semibold text-slate-400 uppercase">Active Workforce</span>
        <div class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">${employees.length} Staff</div>
        <div class="text-[11px] text-slate-500 mt-1">Across 6 departments</div>
      </div>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span class="text-xs font-semibold text-slate-400 uppercase">Monthly Base Commitment</span>
        <div class="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">${formatCurrency(totalMonthlyGross)}</div>
        <div class="text-[11px] text-slate-500 mt-1">Excluding statutory contributions</div>
      </div>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span class="text-xs font-semibold text-slate-400 uppercase">Finance Auto-Posting</span>
        <div class="text-2xl font-bold text-emerald-600 mt-1">Enabled</div>
        <div class="text-[11px] text-slate-500 mt-1">GL Account #5030 synchronized</div>
      </div>
    </div>

    <!-- Payroll Runs History -->
    <div class="space-y-4">
      <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Historical Payroll Runs</h3>
      ${payrolls.map(p => `
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-slate-900 dark:text-slate-100">${escapeHTML(p.month)}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                ${escapeHTML(p.status || 'approved')}
              </span>
            </div>
            <div class="text-xs text-slate-500">Processed for ${p.totalEmployees || employees.length} employees on ${p.processedDate || '2026-03-01'}</div>
          </div>

          <div class="flex items-center gap-6 text-xs">
            <div>
              <span class="text-slate-400 block text-[10px] uppercase">Gross Wages</span>
              <span class="font-mono font-bold">${formatCurrency(p.grossPay)}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase">Deductions (TDS/PF)</span>
              <span class="font-mono font-bold text-rose-600">${formatCurrency(p.totalDeductions)}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase">Net Disbursed</span>
              <span class="font-mono font-bold text-emerald-600 text-sm">${formatCurrency(p.netPay)}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Process Payroll Click
  container.querySelector('#btn-run-payroll').addEventListener('click', async () => {
    const gross = totalMonthlyGross || 1850000;
    const deductions = Math.round(gross * 0.105);
    const net = gross - deductions;

    const payrollRecord = {
      id: `PAY-2026-03`,
      month: 'March 2026',
      totalEmployees: employees.length,
      grossPay: gross,
      totalDeductions: deductions,
      netPay: net,
      status: 'approved',
      processedDate: new Date().toISOString().split('T')[0]
    };

    // 1. Save Payroll
    await dataAdapter.create('payrolls', payrollRecord);

    // 2. Post Journal Entry to Finance (Cross-Module Integration Flow 3)
    const journalRecord = {
      id: `JE-2026-${Date.now().toString().slice(-4)}`,
      entryNumber: `JE-PAY-MAR-2026`,
      date: new Date().toISOString().split('T')[0],
      description: `Payroll disbursement & tax withholding for March 2026`,
      reference: `PAY-MARCH-2026`,
      status: 'posted',
      totalDebit: gross,
      totalCredit: gross,
      lines: [
        { accountId: '5030', accountName: 'Staff Salaries & Wages', debit: gross, credit: 0 },
        { accountId: '1020', accountName: 'HDFC Bank - Current A/C', debit: 0, credit: net },
        { accountId: '2020', accountName: 'Statutory Payroll Deductions (TDS/PF)', debit: 0, credit: deductions }
      ]
    };

    await dataAdapter.create('journal_entries', journalRecord);

    // 3. Emit cross-module event
    await events.emit('hrms.payroll.approved', { payroll: payrollRecord, journal: journalRecord });

    toast.success('Payroll approved & posted automatically into General Ledger!');
    window.location.reload();
  });

  return container;
}

