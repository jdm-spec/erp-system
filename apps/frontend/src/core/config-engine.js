/**
 * Dynamic Customization Configuration Engine
 * Merges system default schemas with tenant runtime overrides.
 * Provides schema versioning, export, import, reset, and custom field registration.
 */

import { events } from './events.js';

class ConfigEngine {
  constructor() {
    this.schemas = new Map();
    this.overrides = new Map();
    this.history = [];
    this.storageKey = 'erp_custom_schemas_v1';
    this.historyKey = 'erp_schema_history_v1';
    this.loadOverridesFromStorage();
  }

  loadOverridesFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [key, val] of Object.entries(parsed)) {
          this.overrides.set(key, val);
        }
      }
      const hist = localStorage.getItem(this.historyKey);
      if (hist) {
        this.history = JSON.parse(hist);
      }
    } catch (e) {
      console.warn('[ConfigEngine] Failed to load schema overrides:', e);
    }
  }

  saveOverridesToStorage() {
    try {
      const obj = {};
      for (const [key, val] of this.overrides.entries()) {
        obj[key] = val;
      }
      localStorage.setItem(this.storageKey, JSON.stringify(obj));
      localStorage.setItem(this.historyKey, JSON.stringify(this.history.slice(0, 50)));
    } catch (e) {
      console.error('[ConfigEngine] Failed to save overrides:', e);
    }
  }

  /**
   * Registers a default module or entity schema definition.
   * @param {string} entityKey - e.g. 'sales_order' or 'invoice'
   * @param {object} defaultSchema
   */
  registerSchema(entityKey, defaultSchema) {
    this.schemas.set(entityKey, defaultSchema);
  }

  /**
   * Gets the merged schema for an entity (defaults + admin customizations).
   * @param {string} entityKey
   * @returns {object}
   */
  getSchema(entityKey) {
    const defaultSchema = this.schemas.get(entityKey) || {
      entityId: entityKey,
      label: entityKey,
      fields: [],
      layout: { sections: [] },
      workflow: { states: {}, transitions: [] }
    };

    const override = this.overrides.get(entityKey);
    if (!override) {
      return JSON.parse(JSON.stringify(defaultSchema));
    }

    // Deep merge fields and overrides
    const merged = JSON.parse(JSON.stringify(defaultSchema));

    if (override.label) merged.label = override.label;
    if (override.numbering) merged.numbering = { ...merged.numbering, ...override.numbering };
    if (override.workflow) merged.workflow = { ...merged.workflow, ...override.workflow };

    // Merge or add fields
    if (Array.isArray(override.fields)) {
      const fieldMap = new Map(merged.fields.map(f => [f.id, f]));
      for (const customField of override.fields) {
        if (fieldMap.has(customField.id)) {
          fieldMap.set(customField.id, { ...fieldMap.get(customField.id), ...customField });
        } else {
          fieldMap.set(customField.id, customField);
        }
      }
      merged.fields = Array.from(fieldMap.values());
    }

    // Merge layout if customized
    if (override.layout) {
      merged.layout = override.layout;
    }

    return merged;
  }

  /**
   * Saves customization for an entity.
   * @param {string} entityKey
   * @param {object} schemaPatch
   * @param {string} reason
   */
  saveSchemaCustomization(entityKey, schemaPatch, reason = 'Admin studio customization') {
    const existing = this.overrides.get(entityKey) || {};
    const updated = {
      ...existing,
      ...schemaPatch,
      updatedAt: new Date().toISOString()
    };

    this.overrides.set(entityKey, updated);

    // Record in history
    this.history.unshift({
      timestamp: new Date().toISOString(),
      entityKey,
      reason,
      version: (this.history.length + 1)
    });

    this.saveOverridesToStorage();
    events.emit('config.schema.updated', { entityKey, schema: this.getSchema(entityKey) });
  }

  /**
   * Adds a custom field to an entity.
   * @param {string} entityKey
   * @param {object} fieldDefinition
   */
  addCustomField(entityKey, fieldDefinition) {
    const current = this.getSchema(entityKey);
    const existingFields = current.fields || [];

    // Check if field id exists
    const idx = existingFields.findIndex(f => f.id === fieldDefinition.id);
    if (idx >= 0) {
      existingFields[idx] = { ...existingFields[idx], ...fieldDefinition };
    } else {
      existingFields.push({ ...fieldDefinition, isCustom: true });
    }

    this.saveSchemaCustomization(entityKey, { fields: existingFields }, `Added custom field ${fieldDefinition.label}`);
  }

  /**
   * Resets customization for an entity or all entities.
   * @param {string} [entityKey]
   */
  resetToDefaults(entityKey = null) {
    if (entityKey) {
      this.overrides.delete(entityKey);
    } else {
      this.overrides.clear();
    }
    this.saveOverridesToStorage();
    events.emit('config.schema.updated', { entityKey: entityKey || '*' });
  }

  /**
   * Export all customizations as a downloadable JSON string.
   */
  exportConfigJSON() {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      overrides: Object.fromEntries(this.overrides.entries()),
      history: this.history
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Imports customizations from JSON string.
   * @param {string} jsonString
   */
  importConfigJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.overrides) {
        for (const [key, val] of Object.entries(data.overrides)) {
          this.overrides.set(key, val);
        }
        this.saveOverridesToStorage();
        events.emit('config.schema.updated', { entityKey: '*' });
        return { success: true };
      }
      return { success: false, error: 'Invalid config structure' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  getHistory() {
    return [...this.history];
  }
}

export const configEngine = new ConfigEngine();

