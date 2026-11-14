/**
 * Minimal & Elegant Modal & Mobile Bottom Sheet Component
 * Mobile-First: Displays as a touch-friendly bottom sheet on mobile screens
 * and a centered, elevated modal on desktop viewports.
 */

import { escapeHTML } from '../core/sanitize.js';

export class Modal {
  /**
   * Opens an accessible dialog.
   * @param {object} options
   * @param {string} options.title
   * @param {string|HTMLElement} options.content
   * @param {string} [options.size='md'] - 'sm' | 'md' | 'lg' | 'xl' | '2xl'
   * @param {Array<object>} [options.actions=[]]
   * @param {Function} [options.onClose]
   * @returns {{ close: Function, el: HTMLElement }}
   */
  static open({ title, content, size = 'md', actions = [], onClose }) {
    const root = document.getElementById('modal-root') || document.body;

    const sizeMap = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      '2xl': 'max-w-5xl'
    };

    // Overlay backdrop
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-200 opacity-0';

    // Sheet / Dialog container
    const dialog = document.createElement('div');
    dialog.className = `w-full ${sizeMap[size] || sizeMap.md} bg-white dark:bg-[#0D0D11] rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden transform translate-y-full sm:translate-y-0 sm:scale-95 transition-transform duration-250 ease-out`;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    // Mobile pull handle indicator
    const pullHandle = document.createElement('div');
    pullHandle.className = 'sm:hidden pt-3 pb-1 flex justify-center';
    pullHandle.innerHTML = `<div class="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>`;
    dialog.appendChild(pullHandle);

    // Header
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-zinc-100 dark:border-zinc-800/60';
    header.innerHTML = `
      <h3 class="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">${escapeHTML(title)}</h3>
      <button type="button" aria-label="Close" class="btn-close-modal text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-lg active:scale-95 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    `;
    dialog.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'px-5 sm:px-6 py-4 max-h-[75vh] sm:max-h-[70vh] overflow-y-auto overscroll-contain';
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }
    dialog.appendChild(body);

    // Footer actions
    if (actions.length > 0) {
      const footer = document.createElement('div');
      footer.className = 'flex flex-col-reverse sm:flex-row items-center justify-end gap-2 px-5 sm:px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30';

      for (const act of actions) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = act.label;
        btn.className = act.primary
          ? 'w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm'
          : 'w-full sm:w-auto px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 rounded-xl active:scale-95 transition-all';

        btn.addEventListener('click', async () => {
          if (act.onClick) {
            const shouldClose = await act.onClick(dialog);
            if (shouldClose !== false) close();
          } else {
            close();
          }
        });
        footer.appendChild(btn);
      }
      dialog.appendChild(footer);
    }

    overlay.appendChild(dialog);
    root.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
      dialog.classList.remove('translate-y-full', 'sm:scale-95');
      dialog.classList.add('translate-y-0', 'sm:scale-100');
    });

    const close = () => {
      overlay.classList.remove('opacity-100');
      overlay.classList.add('opacity-0');
      dialog.classList.remove('translate-y-0', 'sm:scale-100');
      dialog.classList.add('translate-y-full', 'sm:scale-95');
      setTimeout(() => {
        overlay.remove();
        if (onClose) onClose();
      }, 250);
    };

    header.querySelector('.btn-close-modal').addEventListener('click', close);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    const keyListener = (e) => {
      if (e.key === 'Escape') {
        window.removeEventListener('keydown', keyListener);
        close();
      }
    };
    window.addEventListener('keydown', keyListener);

    return { close, el: dialog };
  }
}
