/**
 * Minimal & Elegant Mobile-First Application Bootstrap
 * Wires configuration engines, layout shell, router, command palette, and integration flows.
 */

import './styles/main.css';
import { store } from './core/store.js';
import { router } from './core/router.js';
import { auth } from './core/auth.js';
import { configEngine } from './core/config-engine.js';
import { DEFAULT_SCHEMAS } from './config/defaults/index.js';
import { initCrossModuleIntegration } from './core/integration.js';
import { Topbar } from './components/topbar.js';
import { Sidebar } from './components/sidebar.js';
import { CommandPalette } from './components/command-palette.js';

// 1. Register Default Schemas into Config Engine
for (const [entityKey, schema] of Object.entries(DEFAULT_SCHEMAS)) {
  configEngine.registerSchema(entityKey, schema);
}

// 2. Initialize Event-Driven Cross-Module Integration Flows
initCrossModuleIntegration();

// 3. Register All Dynamic Module Routes
router.registerMultiple([
  {
    path: '#/login',
    loader: () => import('./modules/auth/views/login.js')
  },
  {
    path: '#/dashboard',
    loader: () => import('./modules/dashboard/views/overview.js')
  },
  {
    path: '#/finance/invoices',
    module: 'finance',
    permission: 'finance.view',
    loader: () => import('./modules/finance/invoices.js')
  },
  {
    path: '#/finance/accounts',
    module: 'finance',
    permission: 'finance.view',
    loader: () => import('./modules/finance/accounts.js')
  },
  {
    path: '#/finance/journals',
    module: 'finance',
    permission: 'finance.view',
    loader: () => import('./modules/finance/journals.js')
  },
  {
    path: '#/finance/reports',
    module: 'finance',
    permission: 'finance.view',
    loader: () => import('./modules/finance/reports.js')
  },
  {
    path: '#/inventory/items',
    module: 'inventory',
    permission: 'inventory.view',
    loader: () => import('./modules/inventory/items.js')
  },
  {
    path: '#/inventory/warehouses',
    module: 'inventory',
    permission: 'inventory.view',
    loader: () => import('./modules/inventory/warehouses.js')
  },
  {
    path: '#/inventory/valuation',
    module: 'inventory',
    permission: 'inventory.view',
    loader: () => import('./modules/inventory/valuation.js')
  },
  {
    path: '#/procurement/orders',
    module: 'procurement',
    permission: 'procurement.view',
    loader: () => import('./modules/procurement/orders.js')
  },
  {
    path: '#/procurement/vendors',
    module: 'procurement',
    permission: 'procurement.view',
    loader: () => import('./modules/procurement/vendors.js')
  },
  {
    path: '#/procurement/matching',
    module: 'procurement',
    permission: 'procurement.view',
    loader: () => import('./modules/procurement/matching.js')
  },
  {
    path: '#/sales/orders',
    module: 'sales',
    permission: 'sales.view',
    loader: () => import('./modules/sales/orders.js')
  },
  {
    path: '#/sales/customers',
    module: 'sales',
    permission: 'sales.view',
    loader: () => import('./modules/sales/customers.js')
  },
  {
    path: '#/crm/leads',
    module: 'crm',
    permission: 'crm.view',
    loader: () => import('./modules/crm/leads.js')
  },
  {
    path: '#/crm/tickets',
    module: 'crm',
    permission: 'crm.view',
    loader: () => import('./modules/crm/tickets.js')
  },
  {
    path: '#/hrms/employees',
    module: 'hrms',
    permission: 'hrms.view',
    loader: () => import('./modules/hrms/employees.js')
  },
  {
    path: '#/hrms/payroll',
    module: 'hrms',
    permission: 'hrms.view',
    loader: () => import('./modules/hrms/payroll.js')
  },
  {
    path: '#/manufacturing/work-orders',
    module: 'manufacturing',
    permission: 'manufacturing.view',
    loader: () => import('./modules/manufacturing/work-orders.js')
  },
  {
    path: '#/manufacturing/boms',
    module: 'manufacturing',
    permission: 'manufacturing.view',
    loader: () => import('./modules/manufacturing/boms.js')
  },
  {
    path: '#/scm/shipments',
    module: 'scm',
    permission: 'scm.view',
    loader: () => import('./modules/scm/shipments.js')
  },
  {
    path: '#/scm/forecast',
    module: 'scm',
    permission: 'scm.view',
    loader: () => import('./modules/scm/forecast.js')
  },
  {
    path: '#/projects/list',
    module: 'projects',
    permission: 'projects.view',
    loader: () => import('./modules/projects/list.js')
  },
  {
    path: '#/quality/inspections',
    module: 'quality',
    permission: 'quality.view',
    loader: () => import('./modules/quality/inspections.js')
  },
  {
    path: '#/assets/register',
    module: 'assets',
    permission: 'assets.view',
    loader: () => import('./modules/assets/register.js')
  },
  {
    path: '#/bi/dashboard',
    module: 'bi',
    permission: 'bi.view',
    loader: () => import('./modules/bi/dashboard.js')
  },
  {
    path: '#/admin/studio',
    module: 'admin',
    permission: 'admin.*',
    loader: () => import('./modules/admin/views/studio.js')
  },
  {
    path: '#/admin/roles',
    module: 'admin',
    permission: 'admin.*',
    loader: () => import('./modules/admin/views/roles.js')
  },
  {
    path: '#/admin/audit',
    module: 'admin',
    permission: 'admin.*',
    loader: () => import('./modules/admin/views/audit.js')
  },
  {
    path: '#/admin/settings',
    module: 'admin',
    permission: 'admin.*',
    loader: () => import('./modules/admin/views/settings.js')
  }
]);

// 4. Construct Master UI Layout Shell
function renderApplicationShell() {
  const appRoot = document.getElementById('app');
  if (!appRoot) return;

  const isLoginHash = window.location.hash === '#/login';
  if (isLoginHash || !auth.isAuthenticated()) {
    appRoot.innerHTML = `<div id="main-content" class="h-full"></div>`;
    router.init(document.getElementById('main-content'));
    return;
  }

  appRoot.innerHTML = `
    <div class="flex h-screen overflow-hidden bg-[#FAFAFA] dark:bg-[#09090B]">
      <!-- Dynamic Off-Canvas / Docked Sidebar Mount -->
      <div id="sidebar-mount" class="lg:w-64 flex-shrink-0"></div>

      <!-- Main View Area -->
      <div class="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <!-- Sticky Minimal Topbar -->
        <div id="topbar-mount" class="flex-shrink-0"></div>

        <!-- Scrollable Module Content Viewport -->
        <main id="main-content" class="flex-1 overflow-y-auto overscroll-contain"></main>
      </div>
    </div>
  `;

  document.getElementById('sidebar-mount').appendChild(Sidebar.render());
  document.getElementById('topbar-mount').appendChild(Topbar.render());

  router.init(document.getElementById('main-content'));
  CommandPalette.init();
}

// Re-render layout on auth status changes
window.addEventListener('hashchange', () => {
  const isLogin = window.location.hash === '#/login';
  const hasAppShell = document.getElementById('sidebar-mount');

  if ((isLogin && hasAppShell) || (!isLogin && !hasAppShell && auth.isAuthenticated())) {
    renderApplicationShell();
  }
});

// Bootstrap application immediately without waiting if document is already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApplicationShell);
} else {
  renderApplicationShell();
}
