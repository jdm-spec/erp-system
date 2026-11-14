/**
 * Global Command Palette & Quick Navigation Modal (Ctrl+K)
 */

import { events } from '../core/events.js';
import { MODULE_NAV_ITEMS } from './sidebar.js';
import { escapeHTML } from '../core/sanitize.js';

export class CommandPalette {
  static init() {
    let activePalette = null;

    const open = () => {
      if (activePalette) return;
      activePalette = CommandPalette.render(() => {
        activePalette = null;
      });
      document.body.appendChild(activePalette);
    };

    // Keyboard shortcut: Ctrl+K or Cmd+K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (activePalette) {
          activePalette.remove();
          activePalette = null;
        } else {
          open();
        }
      }
    });

    events.on('command-palette.open', open);
  }

  static render(onClose) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm select-none';

    const panel = document.createElement('div');
    panel.className = 'w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden';

    panel.innerHTML = `
      <div class="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <svg class="w-5 h-5 text-slate-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input type="text" id="palette-search" placeholder="Type a command or jump to module..."
          class="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400" autofocus />
        <kbd class="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 rounded text-slate-400">ESC</kbd>
      </div>

      <div id="palette-results" class="max-h-80 overflow-y-auto p-2 space-y-1">
        <!-- Results injected dynamically -->
      </div>
    `;

    overlay.appendChild(panel);

    const input = panel.querySelector('#palette-search');
    const resultsContainer = panel.querySelector('#palette-results');

    const commands = [];

    // Add navigation items
    for (const item of MODULE_NAV_ITEMS) {
      commands.push({
        id: `nav-${item.id}`,
        title: item.label,
        category: 'Navigation',
        icon: item.icon,
        action: () => { window.location.hash = item.path; }
      });

      if (item.subItems) {
        for (const sub of item.subItems) {
          commands.push({
            id: `nav-${item.id}-${sub.label}`,
            title: `${item.label} → ${sub.label}`,
            category: 'Navigation',
            icon: item.icon,
            action: () => { window.location.hash = sub.path; }
          });
        }
      }
    }

    // Add quick actions
    commands.push({
      id: 'act-so',
      title: 'Create New Sales Order',
      category: 'Quick Action',
      icon: '➕',
      action: () => { window.location.hash = '#/sales/orders?action=new'; }
    });
    commands.push({
      id: 'act-po',
      title: 'Create Purchase Requisition / PO',
      category: 'Quick Action',
      icon: '➕',
      action: () => { window.location.hash = '#/procurement/orders?action=new'; }
    });
    commands.push({
      id: 'act-custom-field',
      title: 'Customization Studio: Add Custom Field',
      category: 'Admin',
      icon: '🛠️',
      action: () => { window.location.hash = '#/admin/studio?tab=fields'; }
    });

    const renderList = (filter = '') => {
      const q = filter.toLowerCase().trim();
      const filtered = q
        ? commands.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
        : commands;

      if (filtered.length === 0) {
        resultsContainer.innerHTML = `<div class="p-4 text-center text-xs text-slate-400">No matching commands</div>`;
        return;
      }

      resultsContainer.innerHTML = filtered.map((c, i) => `
        <div class="palette-item flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-colors" data-idx="${i}">
          <div class="flex items-center gap-2.5">
            <span class="text-base">${c.icon}</span>
            <span class="font-medium">${escapeHTML(c.title)}</span>
          </div>
          <span class="text-[10px] text-slate-400 uppercase font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">${escapeHTML(c.category)}</span>
        </div>
      `).join('');

      resultsContainer.querySelectorAll('.palette-item').forEach(el => {
        el.addEventListener('click', () => {
          const idx = Number(el.getAttribute('data-idx'));
          filtered[idx]?.action();
          close();
        });
      });
    };

    renderList();

    input.addEventListener('input', (e) => {
      renderList(e.target.value);
    });

    const close = () => {
      overlay.remove();
      if (onClose) onClose();
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    window.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        window.removeEventListener('keydown', escHandler);
        close();
      }
    });

    setTimeout(() => input.focus(), 50);

    return overlay;
  }
}

