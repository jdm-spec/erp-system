/**
 * Internationalization and Formatting Engine
 * Manages currency, number, date formatting, and UI translations.
 */

class I18nManager {
  constructor() {
    this.locale = 'en-IN';
    this.currency = 'INR';
    this.currencySymbol = '₹';
    this.dateFormat = 'YYYY-MM-DD';
    this.numberSystem = 'in'; // 'in' (lakh/crore) or 'intl' (million/billion)
    this.translations = {
      en: {
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.create': 'Create New',
        'common.search': 'Search...',
        'common.actions': 'Actions',
        'common.status': 'Status',
        'common.confirm': 'Confirm',
        'common.export': 'Export CSV',
        'common.filter': 'Filter',
        'common.loading': 'Loading...',
        'common.noRecords': 'No records found'
      }
    };
  }

  setSettings(settings = {}) {
    if (settings.locale) this.locale = settings.locale;
    if (settings.currency) this.currency = settings.currency;
    if (settings.currencySymbol) this.currencySymbol = settings.currencySymbol;
    if (settings.dateFormat) this.dateFormat = settings.dateFormat;
    if (settings.numberSystem) this.numberSystem = settings.numberSystem;
  }

  /**
   * Formats a numeric value into localized currency.
   * @param {number|string} amount
   * @param {string} [overrideCurrency]
   * @returns {string}
   */
  formatCurrency(amount, overrideCurrency = null) {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
      return `${this.currencySymbol}0.00`;
    }
    const num = Number(amount);
    const curr = overrideCurrency || this.currency;

    try {
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: curr,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    } catch (e) {
      return `${this.currencySymbol}${num.toFixed(2)}`;
    }
  }

  /**
   * Formats standard numbers with separators.
   * @param {number|string} value
   * @param {number} decimals
   * @returns {string}
   */
  formatNumber(value, decimals = 0) {
    if (value === null || value === undefined || isNaN(Number(value))) return '0';
    const num = Number(value);
    return new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  }

  /**
   * Formats dates according to user setting.
   * @param {string|Date} dateInput
   * @param {boolean} includeTime
   * @returns {string}
   */
  formatDate(dateInput, includeTime = false) {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    let formatted = `${year}-${month}-${day}`;
    if (this.dateFormat === 'DD/MM/YYYY') {
      formatted = `${day}/${month}/${year}`;
    } else if (this.dateFormat === 'MM/DD/YYYY') {
      formatted = `${month}/${day}/${year}`;
    }

    if (includeTime) {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      formatted += ` ${hours}:${minutes}`;
    }

    return formatted;
  }

  /**
   * Calculates human relative time string ("5m ago", "2 hours ago").
   * @param {string|Date} dateInput
   * @returns {string}
   */
  timeAgo(dateInput) {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const diff = (Date.now() - d.getTime()) / 1000;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return this.formatDate(d);
  }

  /**
   * Translates a key, with fallback.
   * @param {string} key
   * @param {string} [fallback]
   * @returns {string}
   */
  t(key, fallback = null) {
    const lang = 'en';
    const dict = this.translations[lang] || {};
    return dict[key] || fallback || key;
  }
}

export const i18n = new I18nManager();
export const t = (key, fallback) => i18n.t(key, fallback);
export const formatCurrency = (amt, curr) => i18n.formatCurrency(amt, curr);
export const formatDate = (d, time) => i18n.formatDate(d, time);
export const formatNumber = (num, dec) => i18n.formatNumber(num, dec);
export const timeAgo = (d) => i18n.timeAgo(d);

