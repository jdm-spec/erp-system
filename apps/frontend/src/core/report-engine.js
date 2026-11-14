/**
 * Schema-Driven Report & Dashboard Engine
 * Computes aggregations, groupings, pivots, and renders high-performance SVG charts and KPI cards.
 */

import { formatCurrency, formatNumber } from './i18n.js';
import { escapeHTML } from './sanitize.js';

export class ReportEngine {
  /**
   * Aggregates records by a categorical field.
   * @param {Array<object>} records
   * @param {string} groupField
   * @param {string} valueField
   * @param {'SUM'|'COUNT'|'AVG'|'MIN'|'MAX'} aggType
   */
  static aggregate(records = [], groupField, valueField, aggType = 'SUM') {
    const map = new Map();

    for (const r of records) {
      const key = r[groupField] || 'Unassigned';
      const val = Number(r[valueField]) || 0;

      if (!map.has(key)) {
        map.set(key, { count: 0, sum: 0, min: val, max: val });
      }
      const entry = map.get(key);
      entry.count += 1;
      entry.sum += val;
      if (val < entry.min) entry.min = val;
      if (val > entry.max) entry.max = val;
    }

    const results = [];
    for (const [key, stat] of map.entries()) {
      let finalVal = 0;
      switch (aggType) {
        case 'SUM': finalVal = stat.sum; break;
        case 'COUNT': finalVal = stat.count; break;
        case 'AVG': finalVal = stat.count > 0 ? (stat.sum / stat.count) : 0; break;
        case 'MIN': finalVal = stat.min; break;
        case 'MAX': finalVal = stat.max; break;
      }
      results.push({ label: key, value: finalVal, count: stat.count });
    }

    return results;
  }

  /**
   * Generates a modern, responsive SVG Bar Chart.
   * @param {Array<{ label: string, value: number }>} data
   * @param {object} [options]
   * @returns {string} SVG markup
   */
  static renderSVGBarChart(data = [], options = {}) {
    if (!data || data.length === 0) {
      return `<div class="p-8 text-center text-xs text-slate-400">No chart data available</div>`;
    }

    const width = options.width || 600;
    const height = options.height || 260;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map(d => d.value), 100);
    const barWidth = Math.max(12, Math.min(48, (chartW / data.length) - 12));

    let bars = '';
    let xLabels = '';

    data.forEach((item, idx) => {
      const x = padding.left + (idx * (chartW / data.length)) + ((chartW / data.length - barWidth) / 2);
      const barH = (item.value / maxVal) * chartH;
      const y = padding.top + chartH - barH;

      bars += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4"
          class="fill-indigo-500 hover:fill-indigo-600 dark:fill-indigo-400 dark:hover:fill-indigo-300 transition-colors cursor-pointer">
          <title>${escapeHTML(item.label)}: ${options.isCurrency ? formatCurrency(item.value) : formatNumber(item.value)}</title>
        </rect>
      `;

      xLabels += `
        <text x="${x + barWidth / 2}" y="${height - 15}" text-anchor="middle"
          class="fill-slate-500 dark:fill-slate-400 text-[10px] font-medium truncate">
          ${escapeHTML(String(item.label).slice(0, 10))}
        </text>
      `;
    });

    // Y-Axis grid lines
    let yTicks = '';
    const ticksCount = 4;
    for (let i = 0; i <= ticksCount; i++) {
      const tickVal = (maxVal / ticksCount) * i;
      const y = padding.top + chartH - ((tickVal / maxVal) * chartH);

      yTicks += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="currentColor" stroke-dasharray="3 3" class="text-slate-200 dark:text-slate-800" />
        <text x="${padding.left - 8}" y="${y + 3}" text-anchor="end" class="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono">
          ${options.isCurrency ? '₹' + Math.round(tickVal / 1000) + 'k' : Math.round(tickVal)}
        </text>
      `;
    }

    return `
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none overflow-visible">
        ${yTicks}
        ${bars}
        ${xLabels}
      </svg>
    `;
  }

  /**
   * Generates a modern SVG Donut Chart.
   * @param {Array<{ label: string, value: number, color?: string }>} data
   * @param {object} [options]
   * @returns {string} SVG markup
   */
  static renderSVGDonutChart(data = [], options = {}) {
    if (!data || data.length === 0) {
      return `<div class="p-8 text-center text-xs text-slate-400">No chart data available</div>`;
    }

    const total = data.reduce((sum, d) => sum + (d.value || 0), 0) || 1;
    const size = options.size || 220;
    const center = size / 2;
    const radius = size * 0.38;
    const strokeWidth = size * 0.16;
    const circumference = 2 * Math.PI * radius;

    const colors = [
      '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6'
    ];

    let accumulatedAngle = 0;
    let paths = '';
    let legend = `<div class="grid grid-cols-2 gap-2 mt-4 text-xs">`;

    data.forEach((item, idx) => {
      const slicePercentage = (item.value || 0) / total;
      const strokeDasharray = `${circumference * slicePercentage} ${circumference * (1 - slicePercentage)}`;
      const strokeDashoffset = -circumference * accumulatedAngle;
      accumulatedAngle += slicePercentage;
      const color = item.color || colors[idx % colors.length];

      paths += `
        <circle cx="${center}" cy="${center}" r="${radius}" fill="transparent"
          stroke="${color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDasharray}" stroke-dashoffset="${strokeDashoffset}"
          class="hover:opacity-80 transition-opacity cursor-pointer">
          <title>${escapeHTML(item.label)}: ${options.isCurrency ? formatCurrency(item.value) : formatNumber(item.value)} (${Math.round(slicePercentage * 100)}%)</title>
        </circle>
      `;

      legend += `
        <div class="flex items-center gap-1.5 truncate">
          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${color}"></span>
          <span class="text-slate-600 dark:text-slate-400 truncate">${escapeHTML(item.label)}</span>
          <span class="font-semibold text-slate-800 dark:text-slate-200 ml-auto">${Math.round(slicePercentage * 100)}%</span>
        </div>
      `;
    });

    legend += `</div>`;

    return `
      <div class="flex flex-col items-center">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="transform -rotate-90">
          ${paths}
        </svg>
        ${legend}
      </div>
    `;
  }
}

