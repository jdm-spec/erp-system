/**
 * Accessible Global Toast Notification Dispatcher
 */

import { escapeHTML } from '../core/sanitize.js';

class ToastManager {
  constructor() {
    this.root = null;
  }

  getRoot() {
    if (!this.root) {
      this.root = document.getElementById('toast-root');
      if (!this.root) {
        this.root = document.createElement('div');
        this.root.id = 'toast-root';
        this.root.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(this.root);
      }
    }
    return this.root;
  }

  /**
   * Show a toast message.
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} [type='info']
   * @param {number} [duration=4000]
   */
  show(message, type = 'info', duration = 4000) {
    const root = this.getRoot();
    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm max-w-md transition-all duration-300 transform translate-y-2 opacity-0`;

    const iconMap = {
      success: '<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
      error: '<svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
      warning: '<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
      info: '<svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
    };

    const colorMap = {
      success: 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900 text-slate-800 dark:text-slate-100',
      error: 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900 text-slate-800 dark:text-slate-100',
      warning: 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900 text-slate-800 dark:text-slate-100',
      info: 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900 text-slate-800 dark:text-slate-100'
    };

    toast.className += ` ${colorMap[type] || colorMap.info}`;
    toast.innerHTML = `
      <div class="flex-shrink-0">${iconMap[type] || iconMap.info}</div>
      <div class="flex-1 font-medium leading-tight">${escapeHTML(message)}</div>
      <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    `;

    root.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    const dismiss = () => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('button').addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  }

  success(msg, dur) { this.show(msg, 'success', dur); }
  error(msg, dur) { this.show(msg, 'error', dur); }
  warning(msg, dur) { this.show(msg, 'warning', dur); }
  info(msg, dur) { this.show(msg, 'info', dur); }
}

export const toast = new ToastManager();

