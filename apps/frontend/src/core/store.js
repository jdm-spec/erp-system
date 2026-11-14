/**
 * Lightweight, reactive pub/sub state store for global app state.
 * Handles persistence for theme and module enablement across browser reloads.
 */

import { events } from './events.js';

const DEFAULT_ENABLED_MODULES = {
  admin: true,
  finance: true,
  inventory: true,
  procurement: true,
  sales: true,
  crm: true,
  hrms: true,
  manufacturing: true,
  scm: true,
  projects: true,
  quality: true,
  assets: true,
  bi: true
};

function loadSavedEnabledModules() {
  try {
    const saved = localStorage.getItem('erp_enabled_modules');
    if (saved) {
      return { ...DEFAULT_ENABLED_MODULES, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('[Store] Could not parse erp_enabled_modules from localStorage:', e);
  }
  return { ...DEFAULT_ENABLED_MODULES };
}

function loadSavedTenant() {
  try {
    const saved = localStorage.getItem('erp_tenant_profile');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return {
    id: 'corp-1',
    name: 'Apex Global Industries',
    legalName: 'Apex Global Industries Pvt Ltd',
    taxId: '27AAAAA0000A1Z5',
    currency: 'INR',
    currencySymbol: '₹',
    fiscalYear: '2026-2027',
    taxSystem: 'GST'
  };
}

class Store {
  constructor(initialState = {}) {
    this.state = {
      user: null,
      tenant: loadSavedTenant(),
      currentBranch: localStorage.getItem('erp_active_branch') || 'HQ - Mumbai Central',
      branches: [
        'HQ - Mumbai Central',
        'Plant 1 - Pune Industrial Zone',
        'Warehouse - Bhiwandi Logistics Hub',
        'Branch Office - Delhi NCR'
      ],
      theme: localStorage.getItem('erp_theme') || 'light',
      isDirty: false,
      dirtyMessage: 'You have unsaved changes. Are you sure you want to discard them?',
      enabledModules: loadSavedEnabledModules(),
      ...initialState
    };

    /** @type {Set<Function>} */
    this.subscribers = new Set();
  }

  /**
   * Get complete state or a specific key.
   * @param {string} [key]
   */
  getState(key) {
    if (key) return this.state[key];
    return { ...this.state };
  }

  /**
   * Updates state partially and notifies subscribers.
   * @param {object|Function} updater - Partial state or updater function
   */
  setState(updater) {
    const prevState = { ...this.state };
    const patch = typeof updater === 'function' ? updater(prevState) : updater;
    this.state = { ...this.state, ...patch };

    // Apply theme change
    if (patch.theme && patch.theme !== prevState.theme) {
      try {
        localStorage.setItem('erp_theme', patch.theme);
      } catch (e) {}
      if (patch.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Persist enabled modules
    if (patch.enabledModules) {
      try {
        localStorage.setItem('erp_enabled_modules', JSON.stringify(this.state.enabledModules));
      } catch (e) {}
      events.emit('modules.toggled', this.state.enabledModules);
    }

    // Persist tenant profile
    if (patch.tenant) {
      try {
        localStorage.setItem('erp_tenant_profile', JSON.stringify(this.state.tenant));
      } catch (e) {}
    }

    // Persist active branch
    if (patch.currentBranch) {
      try {
        localStorage.setItem('erp_active_branch', patch.currentBranch);
      } catch (e) {}
    }

    // Notify all subscribers
    for (const sub of this.subscribers) {
      try {
        sub(this.state, prevState);
      } catch (e) {
        console.error('[Store] Subscriber error:', e);
      }
    }
  }

  /**
   * Subscribes to state updates.
   * @param {Function} listener
   * @returns {Function} Unsubscribe callback
   */
  subscribe(listener) {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  /**
   * Helper to set dirty form state.
   * @param {boolean} dirty
   * @param {string} [customMessage]
   */
  setDirty(dirty, customMessage = null) {
    this.setState({
      isDirty: !!dirty,
      ...(customMessage ? { dirtyMessage: customMessage } : {})
    });
  }
}

export const store = new Store();

// Initialize theme class
if (store.getState('theme') === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
