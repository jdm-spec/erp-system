/**
 * Minimal & Elegant Topbar Component
 * Mobile-First design: touch targets >= 44px, sticky frosted glass header,
 * compact breadcrumbs, and instant access to search & navigation.
 */

import { auth } from '../core/auth.js';
import { store } from '../core/store.js';
import { escapeHTML } from '../core/sanitize.js';
import { events } from '../core/events.js';

export class Topbar {
  static render() {
    const el = document.createElement('header');
    el.className = 'h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-[#0B0B0E]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 select-none';

    const user = auth.getCurrentUser() || { name: 'Admin', role: 'admin', avatar: 'AD' };
    const branches = store.getState('branches') || [];
    const currentBranch = store.getState('currentBranch') || branches[0];
    const isDark = store.getState('theme') === 'dark';

    el.innerHTML = `
      <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <!-- Touch-Friendly Mobile Sidebar Trigger -->
        <button type="button" id="btn-sidebar-toggle" aria-label="Open Navigation Menu"
          class="lg:hidden p-2 -ml-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl active:scale-95 transition-transform">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path></svg>
        </button>

        <!-- Breadcrumbs with responsive mobile truncation -->
        <nav id="topbar-breadcrumbs" class="flex items-center text-xs text-zinc-500 dark:text-zinc-400 gap-1.5 truncate" aria-label="Breadcrumb">
          <a href="#/dashboard" class="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium">Home</a>
          <span class="text-zinc-300 dark:text-zinc-700">/</span>
          <span class="text-zinc-900 dark:text-zinc-100 font-semibold truncate">Dashboard</span>
        </nav>
      </div>

      <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <!-- Quick Search Pill (Desktop) / Search Icon (Mobile) -->
        <button type="button" id="btn-open-palette" aria-label="Open Command Palette"
          class="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 transition-colors">
          <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <span class="hidden md:inline font-normal">Search commands...</span>
          <kbd class="hidden md:inline px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-400">⌘K</kbd>
        </button>

        <!-- Branch Selector (Tablet / Desktop) -->
        <div class="hidden md:block">
          <select id="select-active-branch" aria-label="Select Branch" class="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400">
            ${branches.map(b => `<option value="${escapeHTML(b)}" ${b === currentBranch ? 'selected' : ''}>${escapeHTML(b)}</option>`).join('')}
          </select>
        </div>

        <!-- Minimal Dark/Light Mode Switcher -->
        <button type="button" id="btn-theme-toggle" aria-label="Toggle Theme" class="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-xl transition-colors">
          ${isDark
            ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"></path></svg>'
            : '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"></path></svg>'}
        </button>

        <!-- User Profile Dropdown -->
        <div class="relative group">
          <button type="button" class="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <div class="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs flex items-center justify-center shadow-sm">
              ${escapeHTML(user.avatar || 'AD')}
            </div>
            <div class="hidden lg:block text-left text-xs leading-tight pr-1">
              <div class="font-medium text-zinc-900 dark:text-zinc-100">${escapeHTML(user.name.split(' ')[0])}</div>
              <div class="text-[10px] text-zinc-400 capitalize">${escapeHTML(user.role?.replace(/_/g, ' '))}</div>
            </div>
          </button>

          <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0B0B0E] rounded-xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 py-1 hidden group-hover:block transition-all z-50">
            <div class="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-500 truncate">
              ${escapeHTML(user.email)}
            </div>
            <a href="#/admin/studio" class="block px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800">
              🛠️ Customization Studio
            </a>
            <a href="#/admin/audit" class="block px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800">
              📜 Audit Logs
            </a>
            <button type="button" id="btn-logout" class="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-t border-zinc-100 dark:border-zinc-800/60">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    `;

    // Listen to route breadcrumb updates
    events.on('router.navigated', ({ breadcrumbs }) => {
      const nav = el.querySelector('#topbar-breadcrumbs');
      if (nav && breadcrumbs) {
        nav.innerHTML = breadcrumbs.map((b, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return isLast
            ? `<span class="text-zinc-900 dark:text-zinc-100 font-semibold truncate">${escapeHTML(b.label)}</span>`
            : `<a href="${escapeHTML(b.path)}" class="hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors">${escapeHTML(b.label)}</a> <span class="text-zinc-300 dark:text-zinc-700">/</span>`;
        }).join('');
      }
    });

    // Theme Toggle
    el.querySelector('#btn-theme-toggle').addEventListener('click', () => {
      const current = store.getState('theme');
      store.setState({ theme: current === 'dark' ? 'light' : 'dark' });
      const updated = Topbar.render();
      el.replaceWith(updated);
    });

    // Sidebar Mobile Trigger
    el.querySelector('#btn-sidebar-toggle').addEventListener('click', () => {
      events.emit('sidebar.toggle');
    });

    // Palette Trigger
    el.querySelector('#btn-open-palette').addEventListener('click', () => {
      events.emit('command-palette.open');
    });

    // Logout Trigger
    el.querySelector('#btn-logout').addEventListener('click', () => {
      auth.logout();
    });

    return el;
  }
}
