/**
 * Decoupled Pub/Sub Event Bus for cross-module communication.
 * Modules never import each other's internal logic; they publish and subscribe here.
 */

class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.listeners = new Map();
    /** @type {Array<{ event: string, payload: any, timestamp: string }>} */
    this.history = [];
    this.maxHistory = 100;
  }

  /**
   * Subscribe to an event.
   * @param {string} event - Event name (e.g. 'sales.order.confirmed' or '*' for all)
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (typeof callback !== 'function') return () => {};

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Unsubscribe from an event.
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Subscribe to an event only once.
   * @param {string} event
   * @param {Function} callback
   */
  once(event, callback) {
    const unsub = this.on(event, (payload) => {
      unsub();
      callback(payload);
    });
    return unsub;
  }

  /**
   * Publish an event to all subscribers.
   * @param {string} event - Event name
   * @param {any} [payload] - Event payload
   */
  async emit(event, payload = {}) {
    const timestamp = new Date().toISOString();
    
    // Log in history
    this.history.unshift({ event, payload, timestamp });
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log(`[EventBus] 🚀 ${event}:`, payload);
    }

    const handlers = [];

    // Exact match
    if (this.listeners.has(event)) {
      for (const cb of this.listeners.get(event)) {
        handlers.push(cb);
      }
    }

    // Wildcard match (e.g., 'sales.*' or '*')
    for (const [pattern, cbs] of this.listeners.entries()) {
      if (pattern === '*' || (pattern.endsWith('.*') && event.startsWith(pattern.slice(0, -2)))) {
        for (const cb of cbs) {
          handlers.push(cb);
        }
      }
    }

    // Execute handlers safely
    for (const handler of handlers) {
      try {
        await handler(payload, { event, timestamp });
      } catch (err) {
        console.error(`[EventBus] Error handling event "${event}":`, err);
      }
    }
  }

  /**
   * Returns recent event history for audit/debug viewer.
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Clears all listeners and history.
   */
  clear() {
    this.listeners.clear();
    this.history = [];
  }
}

export const events = new EventBus();

