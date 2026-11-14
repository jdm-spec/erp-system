/**
 * Comprehensive Validation Engine for schema-defined fields.
 */

export const validators = {
  required(value, label = 'Field') {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return `${label} is required`;
    }
    return null;
  },

  email(value, label = 'Email') {
    if (!value) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(String(value).trim())) {
      return `${label} must be a valid email address`;
    }
    return null;
  },

  phone(value, label = 'Phone') {
    if (!value) return null;
    const re = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{6,15}$/;
    if (!re.test(String(value).trim())) {
      return `${label} must be a valid phone number`;
    }
    return null;
  },

  min(value, limit, label = 'Value') {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (isNaN(num) || num < limit) {
      return `${label} must be at least ${limit}`;
    }
    return null;
  },

  max(value, limit, label = 'Value') {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (isNaN(num) || num > limit) {
      return `${label} must be at most ${limit}`;
    }
    return null;
  },

  minLength(value, limit, label = 'Text') {
    if (!value) return null;
    if (String(value).length < limit) {
      return `${label} must be at least ${limit} characters`;
    }
    return null;
  },

  maxLength(value, limit, label = 'Text') {
    if (!value) return null;
    if (String(value).length > limit) {
      return `${label} must be at most ${limit} characters`;
    }
    return null;
  },

  regex(value, patternStr, customMessage = null, label = 'Field') {
    if (!value) return null;
    try {
      const reg = new RegExp(patternStr);
      if (!reg.test(String(value))) {
        return customMessage || `${label} format is invalid`;
      }
    } catch (e) {
      console.warn('Invalid regex in schema validator:', patternStr);
    }
    return null;
  },

  number(value, label = 'Value') {
    if (value === null || value === undefined || value === '') return null;
    if (isNaN(Number(value))) {
      return `${label} must be a valid number`;
    }
    return null;
  }
};

/**
 * Validates a single field against a field schema definition.
 * @param {any} value - Field value to test
 * @param {object} fieldDef - Field definition from schema
 * @param {object} allValues - Complete record object (for cross-field validation)
 * @returns {string|null} Error message or null if valid
 */
export function validateField(value, fieldDef, allValues = {}) {
  const label = fieldDef.label || fieldDef.id;

  if (fieldDef.required) {
    const err = validators.required(value, label);
    if (err) return err;
  }

  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (fieldDef.type === 'email') {
    const err = validators.email(value, label);
    if (err) return err;
  }

  if (fieldDef.type === 'phone') {
    const err = validators.phone(value, label);
    if (err) return err;
  }

  if (fieldDef.type === 'number' || fieldDef.type === 'currency') {
    const err = validators.number(value, label);
    if (err) return err;
  }

  if (fieldDef.min !== undefined) {
    const err = validators.min(value, fieldDef.min, label);
    if (err) return err;
  }

  if (fieldDef.max !== undefined) {
    const err = validators.max(value, fieldDef.max, label);
    if (err) return err;
  }

  if (fieldDef.minLength !== undefined) {
    const err = validators.minLength(value, fieldDef.minLength, label);
    if (err) return err;
  }

  if (fieldDef.maxLength !== undefined) {
    const err = validators.maxLength(value, fieldDef.maxLength, label);
    if (err) return err;
  }

  if (fieldDef.regex) {
    const err = validators.regex(value, fieldDef.regex, fieldDef.regexMessage, label);
    if (err) return err;
  }

  return null;
}

/**
 * Validates an entire record against an entity schema.
 * @param {object} record - Data values
 * @param {object} schema - Entity schema with fields array
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateRecord(record, schema) {
  const errors = {};
  if (!schema || !Array.isArray(schema.fields)) {
    return { isValid: true, errors };
  }

  for (const field of schema.fields) {
    // If field has conditional visibility and condition is false, skip validation
    if (field.condition) {
      const isVisible = evaluateCondition(field.condition, record);
      if (!isVisible) continue;
    }

    const err = validateField(record[field.id], field, record);
    if (err) {
      errors[field.id] = err;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Evaluates simple conditional rule: "field equals/not-equals/in/greater-than value".
 * Example: { "field": "taxType", "operator": "equals", "value": "GST_INTRALOCAL" }
 */
export function evaluateCondition(condition, record) {
  if (!condition || !condition.field) return true;
  const val = record[condition.field];
  const target = condition.value;

  switch (condition.operator) {
    case 'equals':
    case '==':
      return String(val) === String(target);
    case 'notEquals':
    case '!=':
      return String(val) !== String(target);
    case 'contains':
      return String(val || '').toLowerCase().includes(String(target).toLowerCase());
    case 'in':
      return Array.isArray(target) ? target.includes(val) : false;
    case 'gt':
    case '>':
      return Number(val) > Number(target);
    case 'lt':
    case '<':
      return Number(val) < Number(target);
    case 'isNotEmpty':
      return val !== null && val !== undefined && val !== '';
    default:
      return true;
  }
}

