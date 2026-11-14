/**
 * Schema-Aware Vanilla Hash Router
 * Features:
 * - Dynamic route matching with params (`/sales/orders/:id`) & query strings
 * - Route guards: Authentication, RBAC permissions, and Module Enablement
 * - Dynamic import() lazy loading per module
 * - Unsaved form changes prevention guard
 * - Breadcrumb generation, scroll restoration, 403 and 404 views
 * - Minimal, elegant skeleton loading transition
 */

import { auth } from './auth.js';
import { rbac } from './rbac.js';
import { store } from './store.js';
import { events } from './events.js';

class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.currentParams = {};
    this.currentQuery = {};
    this.container = null;
    this.beforeHooks = [];
    this.afterHooks = [];

    window.addEventListener('hashchange', () => this.handleRouting());
  }

  init(containerElement) {
    this.container = containerElement;
    this.handleRouting();
  }

  register(route) {
    this.routes.push(route);
  }

  registerMultiple(routesArray) {
    for (const r of routesArray) {
      this.register(r);
    }
  }

  beforeEach(fn) {
    this.beforeHooks.push(fn);
  }

  afterEach(fn) {
    this.afterHooks.push(fn);
  }

  navigate(hashPath) {
    if (store.getState('isDirty')) {
      const confirmLeave = window.confirm(store.getState('dirtyMessage'));
      if (!confirmLeave) return;
      store.setDirty(false);
    }

    if (window.location.hash === hashPath) {
      this.handleRouting();
    } else {
      window.location.hash = hashPath;
    }
  }

  async handleRouting() {
    if (store.getState('isDirty')) {
      const confirmLeave = window.confirm(store.getState('dirtyMessage'));
      if (!confirmLeave) {
        if (this.currentRoute) {
          window.location.hash = this.currentRoute.path;
        }
        return;
      }
      store.setDirty(false);
    }

    const rawHash = window.location.hash || '#/dashboard';
    const [pathPart, queryPart] = rawHash.split('?');
    const path = pathPart.startsWith('#') ? pathPart : `#${pathPart}`;

    const query = {};
    if (queryPart) {
      new URLSearchParams(queryPart).forEach((v, k) => { query[k] = v; });
    }
    this.currentQuery = query;

    let matchedRoute = null;
    let params = {};

    for (const route of this.routes) {
      const match = this.matchRoute(route.path, path);
      if (match) {
        matchedRoute = route;
        params = match;
        break;
      }
    }

    this.currentParams = params;

    if (!matchedRoute) {
      this.render404(path);
      return;
    }

    if (matchedRoute.path !== '#/login' && !auth.isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }

    if (matchedRoute.module) {
      const enabledModules = store.getState('enabledModules') || {};
      if (enabledModules[matchedRoute.module] === false) {
        this.renderDisabledModule(matchedRoute.module);
        return;
      }
    }

    if (matchedRoute.permission) {
      const user = auth.getCurrentUser();
      if (!rbac.hasPermission(user, matchedRoute.permission)) {
        this.render403(matchedRoute.permission);
        return;
      }
    }

    for (const hook of this.beforeHooks) {
      const result = await hook(matchedRoute, { params, query });
      if (result === false) return;
    }

    this.currentRoute = matchedRoute;
    await this.renderView(matchedRoute, params, query);

    window.scrollTo(0, 0);
    events.emit('router.navigated', {
      route: matchedRoute,
      path,
      params,
      query,
      breadcrumbs: this.generateBreadcrumbs(path)
    });

    for (const hook of this.afterHooks) {
      hook(matchedRoute);
    }
  }

  matchRoute(pattern, currentPath) {
    const patternSegments = pattern.split('/');
    const pathSegments = currentPath.split('/');

    if (patternSegments.length !== pathSegments.length) return null;

    const params = {};
    for (let i = 0; i < patternSegments.length; i++) {
      const p = patternSegments[i];
      const s = pathSegments[i];

      if (p.startsWith(':')) {
        params[p.slice(1)] = decodeURIComponent(s);
      } else if (p !== s) {
        return null;
      }
    }

    return params;
  }

  async renderView(route, params, query) {
    if (!this.container) return;

    // Minimal Elegant Skeleton Loader
    this.container.innerHTML = `
      <div class="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-pulse select-none">
        <div class="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-48"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div class="h-28 bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-3">
            <div class="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
            <div class="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
          </div>
          <div class="h-28 bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-3">
            <div class="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
            <div class="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
          </div>
          <div class="h-28 bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-3">
            <div class="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
            <div class="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
          </div>
          <div class="h-28 bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-3">
            <div class="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
            <div class="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
          </div>
        </div>
        <div class="h-72 bg-white dark:bg-[#0D0D11] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 space-y-3">
          <div class="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
          <div class="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded w-full"></div>
          <div class="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded w-full"></div>
          <div class="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded w-4/5"></div>
        </div>
      </div>
    `;

    try {
      let viewModule = await route.loader();
      const viewFn = viewModule.default || viewModule;

      this.container.innerHTML = '';
      if (typeof viewFn === 'function') {
        const rendered = await viewFn({ params, query, router: this });
        if (rendered instanceof HTMLElement) {
          this.container.appendChild(rendered);
        } else if (typeof rendered === 'string') {
          this.container.innerHTML = rendered;
        }
      } else if (viewFn instanceof HTMLElement) {
        this.container.appendChild(viewFn);
      }
    } catch (err) {
      console.error('[Router] Failed to render view:', err);
      this.renderError(err);
    }
  }

  generateBreadcrumbs(path) {
    const parts = path.replace(/^#\//, '').split('/');
    const breadcrumbs = [{ label: 'Home', path: '#/dashboard' }];

    let acc = '#';
    for (const part of parts) {
      acc += `/${part}`;
      const label = part.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      breadcrumbs.push({ label, path: acc });
    }

    return breadcrumbs;
  }

  render404(path) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 class="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Page Not Found</h1>
        <p class="text-xs text-zinc-500 max-w-sm mb-6">The path <code class="font-mono text-zinc-800 dark:text-zinc-200">${path}</code> does not exist.</p>
        <a href="#/dashboard" class="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold">Return to Dashboard</a>
      </div>
    `;
  }

  render403(perm) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 class="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Restricted Access</h1>
        <p class="text-xs text-zinc-500 max-w-sm mb-6">Permission required: <code class="font-mono text-rose-500 font-semibold">${perm}</code>.</p>
        <a href="#/dashboard" class="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold">Return to Dashboard</a>
      </div>
    `;
  }

  renderDisabledModule(modId) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 class="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Module Inactive</h1>
        <p class="text-xs text-zinc-500 max-w-sm mb-6">The <span class="font-semibold capitalize">${modId}</span> module is currently deactivated in the Customization Studio.</p>
        <a href="#/admin/studio" class="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold">Go to Studio</a>
      </div>
    `;
  }

  renderError(err) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="p-6 max-w-xl mx-auto my-12 bg-white dark:bg-[#0D0D11] border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-sm">
        <h2 class="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">Render Error</h2>
        <p class="text-xs text-zinc-500 font-mono mb-4">${err.message}</p>
        <button onclick="window.location.reload()" class="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-xl">Reload</button>
      </div>
    `;
  }
}

export const router = new Router();
