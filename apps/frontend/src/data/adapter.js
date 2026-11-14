/**
 * Data Adapter Interface
 * Provides unified data access layer whether using local storage or remote REST API.
 */

export class DataAdapter {
  /**
   * List records with optional filtering, sorting, and pagination.
   * @param {string} entity - Name of entity (e.g. 'sales_orders')
   * @param {object} [params] - { filter, sort, page, limit, search }
   * @returns {Promise<{ data: Array, total: number, page: number, limit: number }>}
   */
  async list(entity, params = {}) {
    throw new Error('Method list() must be implemented.');
  }

  /**
   * Get single record by ID.
   * @param {string} entity
   * @param {string|number} id
   * @returns {Promise<object|null>}
   */
  async get(entity, id) {
    throw new Error('Method get() must be implemented.');
  }

  /**
   * Create a new record.
   * @param {string} entity
   * @param {object} data
   * @returns {Promise<object>}
   */
  async create(entity, data) {
    throw new Error('Method create() must be implemented.');
  }

  /**
   * Update an existing record.
   * @param {string} entity
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise<object>}
   */
  async update(entity, id, data) {
    throw new Error('Method update() must be implemented.');
  }

  /**
   * Remove a record (soft-delete by default).
   * @param {string} entity
   * @param {string|number} id
   * @param {boolean} [hardDelete=false]
   * @returns {Promise<boolean>}
   */
  async remove(entity, id, hardDelete = false) {
    throw new Error('Method remove() must be implemented.');
  }

  /**
   * Query records matching a filter predicate.
   * @param {string} entity
   * @param {Function|object} query
   * @returns {Promise<Array>}
   */
  async query(entity, query) {
    throw new Error('Method query() must be implemented.');
  }

  /**
   * Batch transactional operations.
   * @param {Array<{ type: 'create'|'update'|'delete', entity: string, id?: string|number, data?: object }>} operations
   * @returns {Promise<boolean>}
   */
  async transaction(operations) {
    throw new Error('Method transaction() must be implemented.');
  }
}

