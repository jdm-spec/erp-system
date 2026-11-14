/**
 * Firebase Realtime Database Adapter
 * Implements the DataAdapter interface to sync all ERP entities in real-time
 * with Firebase Realtime Database using the official REST endpoints.
 * Features automatic seeding, offline fallback, and change auditing.
 */

import { DataAdapter } from './adapter.js';
import { localAdapter } from './local-adapter.js';
import { audit } from '../core/audit.js';

export const firebaseConfig = typeof __FIREBASE_CONFIG__ !== 'undefined' ? __FIREBASE_CONFIG__ : {};

export class FirebaseAdapter extends DataAdapter {
  constructor() {
    super();
    this.name = 'Firebase Cloud';
    this.baseUrl = (firebaseConfig?.databaseURL || '').replace(/\/$/, '');
    this.idToken = null;
    this.permissionDenied = false;

    // If marked locked in this browser session, stay offline to prevent 401 console noise
    const isLocked = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('erp_rtdb_locked') === 'true';
    if (isLocked) {
      this.isOnline = false;
      this.permissionDenied = true;
      this.readyPromise = Promise.resolve();
    } else {
      this.isOnline = Boolean(this.baseUrl);
      this.readyPromise = this.baseUrl ? this.initConnection() : Promise.resolve();
    }
  }

  getEndpoint(path, extraQuery = '') {
    const separator = path.includes('?') ? '&' : '?';
    let url = `${this.baseUrl}/${path}`;
    const params = [];
    if (this.idToken) {
      params.push(`auth=${encodeURIComponent(this.idToken)}`);
    }
    if (extraQuery) {
      params.push(extraQuery);
    }
    if (params.length > 0) {
      url += `${separator}${params.join('&')}`;
    }
    return url;
  }

  async initConnection() {
    try {
      // 1. Try to authenticate anonymously if apiKey is present
      if (firebaseConfig?.apiKey) {
        try {
          const authRes = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ returnSecureToken: true })
            }
          );
          if (authRes.ok) {
            const authData = await authRes.json();
            if (authData?.idToken) {
              this.idToken = authData.idToken;
            }
          }
        } catch (e) {
          // Silent catch for auth attempt; will test RTDB directly
        }
      }

      // 2. Test read permissions on Firebase RTDB
      const testUrl = this.getEndpoint('accounts.json', 'shallow=true');
      const res = await fetch(testUrl);

      if (res.status === 401 || res.status === 403) {
        this.isOnline = false;
        this.permissionDenied = true;
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('erp_rtdb_locked', 'true');
        }
        console.warn(
          '[FirebaseAdapter] Firebase Realtime Database returned 401 (Permission Denied).\n' +
          'Switched automatically to local offline mode (all data stored in browser).\n' +
          '👉 To enable live Firebase cloud sync, set rules in Firebase Console:\n' +
          '{\n  "rules": {\n    ".read": true,\n    ".write": true\n  }\n}'
        );
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (!data || Object.keys(data).length === 0) {
          console.log('[FirebaseAdapter] Connected to Firebase RTDB. Seeding initial records...');
          await this.seedAll();
        }
      } else {
        this.isOnline = false;
      }
    } catch (e) {
      this.isOnline = false;
    }
  }

  async retryConnection() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('erp_rtdb_locked');
    }
    this.isOnline = Boolean(this.baseUrl);
    this.permissionDenied = false;
    this.readyPromise = this.initConnection();
    await this.readyPromise;
    return this.isOnline;
  }

  async seedAll() {
    if (!this.baseUrl || !this.isOnline) return;

    const seedEntities = [
      'accounts', 'journal_entries', 'invoices', 'items', 'warehouses',
      'vendors', 'purchase_orders', 'customers', 'sales_orders', 'leads',
      'support_tickets', 'employees', 'payrolls', 'boms', 'work_orders',
      'shipments', 'projects', 'inspections', 'assets'
    ];

    for (const entity of seedEntities) {
      const items = localAdapter.readAll(entity);
      if (items && items.length > 0) {
        const payload = {};
        for (const item of items) {
          payload[item.id] = item;
        }
        await fetch(this.getEndpoint(`${entity}.json`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      }
    }
  }

  async list(entity, params = {}) {
    if (this.readyPromise) {
      await this.readyPromise;
    }

    if (!this.baseUrl || !this.isOnline) {
      return localAdapter.list(entity, params);
    }

    try {
      const res = await fetch(this.getEndpoint(`${entity}.json`));
      if (res.status === 401 || res.status === 403) {
        this.isOnline = false;
        this.permissionDenied = true;
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('erp_rtdb_locked', 'true');
        }
        return localAdapter.list(entity, params);
      }

      if (!res.ok) {
        throw new Error(`Firebase RTDB HTTP ${res.status}`);
      }

      const raw = await res.json();
      let items = [];

      if (raw) {
        if (Array.isArray(raw)) {
          items = raw.filter(Boolean);
        } else if (typeof raw === 'object') {
          items = Object.entries(raw).map(([key, val]) => ({
            ...val,
            id: val?.id || key
          }));
        }
      }

      if (items.length === 0) {
        return localAdapter.list(entity, params);
      }

      if (!params.includeDeleted) {
        items = items.filter(item => !item._deleted);
      }

      if (params.search) {
        const query = params.search.toLowerCase();
        items = items.filter(item => {
          return Object.values(item).some(val => {
            if (val === null || val === undefined) return false;
            return String(val).toLowerCase().includes(query);
          });
        });
      }

      if (params.filter) {
        for (const [key, val] of Object.entries(params.filter)) {
          if (val !== undefined && val !== null && val !== '') {
            items = items.filter(item => String(item[key]) === String(val));
          }
        }
      }

      if (params.sortBy) {
        const field = params.sortBy;
        const asc = params.sortOrder !== 'desc';
        items.sort((a, b) => {
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          if (valA < valB) return asc ? -1 : 1;
          if (valA > valB) return asc ? 1 : -1;
          return 0;
        });
      }

      const total = items.length;
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 25;
      const startIndex = (page - 1) * limit;
      const pagedData = items.slice(startIndex, startIndex + limit);

      return {
        data: pagedData,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (err) {
      this.isOnline = false;
      return localAdapter.list(entity, params);
    }
  }

  async get(entity, id) {
    if (this.readyPromise) {
      await this.readyPromise;
    }

    if (!this.baseUrl || !this.isOnline) {
      return localAdapter.get(entity, id);
    }

    try {
      const res = await fetch(this.getEndpoint(`${entity}/${encodeURIComponent(id)}.json`));
      if (res.status === 401 || res.status === 403) {
        this.isOnline = false;
        return localAdapter.get(entity, id);
      }
      if (res.ok) {
        const data = await res.json();
        if (data && !data._deleted) {
          return { ...data, id: data.id || id };
        }
      }
    } catch (e) {
      this.isOnline = false;
    }
    return localAdapter.get(entity, id);
  }

  async create(entity, data) {
    if (this.readyPromise) {
      await this.readyPromise;
    }

    const id = data.id || `${entity.slice(0, 3).toUpperCase()}-${Date.now()}`;
    const newRecord = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.baseUrl && this.isOnline) {
      try {
        const res = await fetch(this.getEndpoint(`${entity}/${encodeURIComponent(id)}.json`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord)
        });
        if (res.status === 401 || res.status === 403) {
          this.isOnline = false;
        }
      } catch (e) {
        this.isOnline = false;
      }
    }

    await localAdapter.create(entity, newRecord).catch(() => {});

    await audit.log({
      module: entity.split('_')[0],
      entity,
      entityId: id,
      action: 'create',
      changes: newRecord
    });

    return newRecord;
  }

  async update(entity, id, data) {
    if (this.readyPromise) {
      await this.readyPromise;
    }

    const oldRecord = await this.get(entity, id);
    const updatedRecord = {
      ...oldRecord,
      ...data,
      id,
      updatedAt: new Date().toISOString()
    };

    if (this.baseUrl && this.isOnline) {
      try {
        const res = await fetch(this.getEndpoint(`${entity}/${encodeURIComponent(id)}.json`), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedRecord)
        });
        if (res.status === 401 || res.status === 403) {
          this.isOnline = false;
        }
      } catch (e) {
        this.isOnline = false;
      }
    }

    await localAdapter.update(entity, id, updatedRecord).catch(() => {});

    const diff = audit.computeDiff(oldRecord, updatedRecord);
    if (diff) {
      await audit.log({
        module: entity.split('_')[0],
        entity,
        entityId: id,
        action: 'update',
        changes: diff
      });
    }

    return updatedRecord;
  }

  async remove(entity, id, hardDelete = false) {
    if (this.readyPromise) {
      await this.readyPromise;
    }

    if (this.baseUrl && this.isOnline) {
      try {
        if (hardDelete) {
          await fetch(this.getEndpoint(`${entity}/${encodeURIComponent(id)}.json`), {
            method: 'DELETE'
          });
        } else {
          await fetch(this.getEndpoint(`${entity}/${encodeURIComponent(id)}.json`), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _deleted: true, deletedAt: new Date().toISOString() })
          });
        }
      } catch (e) {
        this.isOnline = false;
      }
    }

    await localAdapter.remove(entity, id, hardDelete).catch(() => {});

    await audit.log({
      module: entity.split('_')[0],
      entity,
      entityId: id,
      action: 'delete'
    });

    return true;
  }

  async query(entity, predicateOrFilter) {
    const result = await this.list(entity, { limit: 1000 });
    const items = result.data || [];

    if (typeof predicateOrFilter === 'function') {
      return items.filter(predicateOrFilter);
    }
    if (typeof predicateOrFilter === 'object') {
      return items.filter(item => {
        return Object.entries(predicateOrFilter).every(([k, v]) => String(item[k]) === String(v));
      });
    }
    return items;
  }

  async transaction(operations) {
    for (const op of operations) {
      if (op.type === 'create') {
        await this.create(op.entity, op.data);
      } else if (op.type === 'update') {
        await this.update(op.entity, op.id, op.data);
      } else if (op.type === 'delete') {
        await this.remove(op.entity, op.id);
      }
    }
    return true;
  }
}

export const firebaseAdapter = new FirebaseAdapter();
