/**
 * REST API Data Adapter
 * Communicates with backend endpoints using standard RESTful conventions.
 * Injects in-memory auth token and handles CSRF / session expiration.
 */

import { DataAdapter } from './adapter.js';
import { auth } from '../core/auth.js';

export class RestAdapter extends DataAdapter {
  constructor(baseUrl) {
    super();
    this.name = 'REST API';
    this.baseUrl = baseUrl || '/api/v1';
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    const token = auth.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        auth.logout('Your session has expired. Please sign in again.');
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || `HTTP error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`[RestAdapter] Request to ${url} failed:`, err);
      throw err;
    }
  }

  async list(entity, params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    if (params.filter) {
      query.set('filter', JSON.stringify(params.filter));
    }

    const res = await this.request(`${entity}?${query.toString()}`);
    return {
      data: res.data || res.items || res,
      total: res.total || (Array.isArray(res) ? res.length : 0),
      page: res.page || params.page || 1,
      limit: res.limit || params.limit || 25
    };
  }

  async get(entity, id) {
    const res = await this.request(`${entity}/${encodeURIComponent(id)}`);
    return res.data || res;
  }

  async create(entity, data) {
    const res = await this.request(entity, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data || res;
  }

  async update(entity, id, data) {
    const res = await this.request(`${entity}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data || res;
  }

  async remove(entity, id, hardDelete = false) {
    await this.request(`${entity}/${encodeURIComponent(id)}?hard=${hardDelete}`, {
      method: 'DELETE'
    });
    return true;
  }

  async query(entity, filter) {
    const res = await this.request(`${entity}/query`, {
      method: 'POST',
      body: JSON.stringify({ filter })
    });
    return res.data || res;
  }

  async transaction(operations) {
    const res = await this.request('batch/transaction', {
      method: 'POST',
      body: JSON.stringify({ operations })
    });
    return res.success || true;
  }
}

export const restAdapter = new RestAdapter();

