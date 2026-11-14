/**
 * Core HTML sanitization and string escaping helpers.
 * Prevents XSS vulnerabilities across all rendered views and templates.
 */

/**
 * Escapes characters with special meaning in HTML.
 * @param {any} val - Value to escape
 * @returns {string} Escaped safe HTML string
 */
export function escapeHTML(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapes values destined for HTML attributes.
 * @param {any} val - Value to escape
 * @returns {string} Escaped safe attribute string
 */
export function escapeAttr(val) {
  return escapeHTML(val);
}

/**
 * Tagged template literal for safely building HTML strings.
 * Interpolated expressions are automatically escaped unless wrapped in rawHTML().
 * 
 * Example:
 *   html`<div class="p-4">${userInput}</div>`
 */
export function html(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      const val = values[i];
      if (val && val.__isRawHTML) {
        result += val.value;
      } else if (Array.isArray(val)) {
        result += val.map(item => (item && item.__isRawHTML ? item.value : escapeHTML(item))).join('');
      } else {
        result += escapeHTML(val);
      }
    }
  }
  return result;
}

/**
 * Marks a pre-sanitized or system-generated string as safe raw HTML.
 * Use with extreme caution.
 * @param {string} str - Safe HTML markup
 * @returns {object} Wrapped safe raw HTML object
 */
export function rawHTML(str) {
  return {
    __isRawHTML: true,
    value: str || ''
  };
}

/**
 * Creates a DOM node safely from an HTML string without script execution risks.
 * @param {string} htmlString - Valid HTML markup
 * @returns {HTMLElement} Parsed DOM Element
 */
export function createElementFromHTML(htmlString) {
  const template = document.createElement('template');
  template.innerHTML = (htmlString || '').trim();
  return template.content.firstElementChild || document.createElement('div');
}

