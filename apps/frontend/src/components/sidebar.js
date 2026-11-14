/**
 * Minimal & Elegant Sidebar Navigation Component
 * Mobile-First: Operates as an off-canvas drawer on mobile screens with backdrop dismiss,
 * and seamlessly docks as a refined persistent sidebar on desktop displays.
 */

import { store } from '../core/store.js';
import { escapeHTML } from '../core/sanitize.js';
import { events } from '../core/events.js';
import { dataAdapter } from '../data/index.js';

export const MODULE_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"></path></svg>`,
    path: '#/dashboard'
  },
  {
    id: 'finance',
    label: 'Finance & GL',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"></path></svg>`,
    path: '#/finance/invoices',
    subItems: [
      { label: 'Invoices & Billing', path: '#/finance/invoices' },
      { label: 'Chart of Accounts', path: '#/finance/accounts' },
      { label: 'Journal Postings', path: '#/finance/journals' },
      { label: 'Financial Statements', path: '#/finance/reports' }
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"></path></svg>`,
    path: '#/inventory/items',
    subItems: [
      { label: 'Item SKU Master', path: '#/inventory/items' },
      { label: 'Warehouses & Bins', path: '#/inventory/warehouses' },
      { label: 'Stock Valuation', path: '#/inventory/valuation' }
    ]
  },
  {
    id: 'procurement',
    label: 'Procurement',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path></svg>`,
    path: '#/procurement/orders',
    subItems: [
      { label: 'Purchase Orders', path: '#/procurement/orders' },
      { label: 'Vendor Directory', path: '#/procurement/vendors' },
      { label: '3-Way Matching', path: '#/procurement/matching' }
    ]
  },
  {
    id: 'sales',
    label: 'Sales (O2C)',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6H2.25m0 0v1.5M3 6.75h1.5a.75.75 0 01.75.75v.75m-3-1.5h1.5m0 0v1.5m0-1.5h.75m11.25-3h3.75a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25h-3.75m0-16.5v16.5m0-16.5H12m0 0v16.5m0-16.5H8.25m0 0v16.5m0-16.5H4.5"></path></svg>`,
    path: '#/sales/orders',
    subItems: [
      { label: 'Sales Orders', path: '#/sales/orders' },
      { label: 'Customer 360', path: '#/sales/customers' }
    ]
  },
  {
    id: 'crm',
    label: 'CRM & Tickets',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"></path></svg>`,
    path: '#/crm/leads',
    subItems: [
      { label: 'Pipeline Leads', path: '#/crm/leads' },
      { label: 'Support Tickets', path: '#/crm/tickets' }
    ]
  },
  {
    id: 'hrms',
    label: 'HR & Payroll',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path></svg>`,
    path: '#/hrms/employees',
    subItems: [
      { label: 'Staff Register', path: '#/hrms/employees' },
      { label: 'Payroll Runs', path: '#/hrms/payroll' }
    ]
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.67 2.67 0 0021 17.25l-5.83-5.83M5.25 15.75L2.83 18.17a2.67 2.67 0 003.77 3.77l2.42-2.42M12 9a3 3 0 100-6 3 3 0 000 6z"></path></svg>`,
    path: '#/manufacturing/work-orders',
    subItems: [
      { label: 'Work Orders', path: '#/manufacturing/work-orders' },
      { label: 'Bills of Materials', path: '#/manufacturing/boms' }
    ]
  },
  {
    id: 'scm',
    label: 'Supply Chain',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75A1.125 1.125 0 0013.125 2.625H4.875A1.125 1.125 0 003.75 3.75v10.5c0 .621.504 1.125 1.125 1.125h1.5"></path></svg>`,
    path: '#/scm/shipments',
    subItems: [
      { label: 'Shipments', path: '#/scm/shipments' },
      { label: 'Demand Forecast', path: '#/scm/forecast' }
    ]
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"></path></svg>`,
    path: '#/projects/list'
  },
  {
    id: 'quality',
    label: 'Quality',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"></path></svg>`,
    path: '#/quality/inspections'
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"></path></svg>`,
    path: '#/assets/register'
  },
  {
    id: 'bi',
    label: 'Intelligence (BI)',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"></path></svg>`,
    path: '#/bi/dashboard'
  },
  {
    id: 'admin',
    label: 'Studio & Admin',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.869a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
    path: '#/admin/studio',
    subItems: [
      { label: 'Customization Studio', path: '#/admin/studio' },
      { label: 'Roles & RBAC', path: '#/admin/roles' },
      { label: 'Audit Trail Logs', path: '#/admin/audit' },
      { label: 'Tenant Settings', path: '#/admin/settings' }
    ]
  }
];

export class Sidebar {
  static render() {
    const wrapper = document.createElement('div');
    wrapper.id = 'sidebar-container';
    wrapper.className = 'relative z-40';

    const tenant = store.getState('tenant') || { name: 'Apex Enterprise' };
    const enabledMods = store.getState('enabledModules') || {};
    const currentHash = window.location.hash || '#/dashboard';

    const visibleItems = MODULE_NAV_ITEMS.filter(item => {
      if (item.id === 'dashboard') return true;
      return enabledMods[item.id] !== false;
    });

    let navListHTML = '';
    for (const item of visibleItems) {
      const isActive = currentHash.startsWith(item.path);
      const activeClass = isActive
        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium shadow-sm'
        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60';

      navListHTML += `
        <li>
          <a href="${escapeHTML(item.path)}" data-nav-link="true" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 ${activeClass}">
            <span class="flex-shrink-0">${item.icon}</span>
            <span class="flex-1 truncate">${escapeHTML(item.label)}</span>
          </a>
      `;

      if (item.subItems && isActive) {
        navListHTML += `<ul class="my-1.5 ml-4 pl-3 border-l border-zinc-200/80 dark:border-zinc-800 space-y-1">`;
        for (const sub of item.subItems) {
          const isSubActive = currentHash === sub.path;
          const subClass = isSubActive
            ? 'text-zinc-900 dark:text-zinc-100 font-semibold pl-1'
            : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200';

          navListHTML += `
            <li>
              <a href="${escapeHTML(sub.path)}" data-nav-link="true" class="block py-1.5 text-[11px] transition-colors truncate ${subClass}">
                ${escapeHTML(sub.label)}
              </a>
            </li>
          `;
        }
        navListHTML += `</ul>`;
      }

      navListHTML += `</li>`;
    }

    wrapper.innerHTML = `
      <!-- Mobile Backdrop Overlay -->
      <div id="sidebar-backdrop" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 opacity-0 pointer-events-none transition-opacity duration-200 lg:hidden"></div>

      <!-- Drawer Content -->
      <aside id="sidebar-drawer" class="fixed inset-y-0 left-0 z-40 w-72 lg:w-64 bg-white dark:bg-[#0B0B0E] border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col h-full transform -translate-x-full lg:translate-x-0 transition-transform duration-250 ease-out select-none">
        
        <!-- Brand Header with touch dismiss button on mobile -->
        <div class="h-16 flex items-center justify-between px-5 border-b border-zinc-100 dark:border-zinc-800/60">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-wider">
              ✦
            </div>
            <div class="min-w-0">
              <div class="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100 truncate">${escapeHTML(tenant.name)}</div>
              <div class="text-[10px] text-zinc-400 tracking-wide font-mono uppercase">ERP Platform</div>
            </div>
          </div>
          <button type="button" id="btn-close-mobile-sidebar" class="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 lg:hidden rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Navigation items list -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div class="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Navigation</div>
          <ul class="space-y-1">
            ${navListHTML}
          </ul>
        </nav>

        <!-- Minimal System Status Indicator -->
        <div class="p-4 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
          <div class="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span class="text-[11px] font-medium">Data Layer</span>
            <span class="inline-flex items-center gap-1.5 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ${escapeHTML(dataAdapter?.name || 'Local')}
            </span>
          </div>
        </div>
      </aside>
    `;

    // Drawer controllers for mobile touch experience
    const backdrop = wrapper.querySelector('#sidebar-backdrop');
    const drawer = wrapper.querySelector('#sidebar-drawer');
    const closeBtn = wrapper.querySelector('#btn-close-mobile-sidebar');

    const openDrawer = () => {
      drawer.classList.remove('-translate-x-full');
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100', 'pointer-events-auto');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.add('-translate-x-full');
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    // Auto-close drawer on mobile when any navigation link is clicked
    wrapper.querySelectorAll('[data-nav-link]').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
          closeDrawer();
        }
      });
    });

    events.on('sidebar.toggle', () => {
      if (drawer.classList.contains('-translate-x-full')) {
        openDrawer();
      } else {
        closeDrawer();
      }
    });

    events.on('router.navigated', () => {
      const parent = wrapper.parentElement;
      if (parent) {
        const updated = Sidebar.render();
        wrapper.replaceWith(updated);
      }
    });

    store.subscribe((state, prev) => {
      if (state.enabledModules !== prev.enabledModules) {
        const parent = wrapper.parentElement;
        if (parent) {
          const updated = Sidebar.render();
          wrapper.replaceWith(updated);
        }
      }
    });

    return wrapper;
  }
}
