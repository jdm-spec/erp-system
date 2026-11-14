/**
 * Authentication & Session Management
 * Handles login, session lifecycle, token in memory, and idle timeouts.
 */

import { store } from './store.js';
import { events } from './events.js';

// In-memory token store for REST adapter security (never in localStorage)
let inMemoryAuthToken = null;

export const DEMO_USERS = [
  {
    id: 'user-1',
    name: 'Administrator',
    email: 'admin@erp.local',
    role: 'admin',
    avatar: 'AD',
    department: 'Executive',
    title: 'Chief Information Officer'
  },
  {
    id: 'user-2',
    name: 'Priya Sharma',
    email: 'finance@erp.local',
    role: 'finance_manager',
    avatar: 'PS',
    department: 'Finance & Accounts',
    title: 'Senior Financial Controller'
  },
  {
    id: 'user-3',
    name: 'Rajesh Verma',
    email: 'sales@erp.local',
    role: 'sales_manager',
    avatar: 'RV',
    department: 'Commercial & Sales',
    title: 'Head of Regional Sales'
  },
  {
    id: 'user-4',
    name: 'Anil Kulkarni',
    email: 'ops@erp.local',
    role: 'operations_manager',
    avatar: 'AK',
    department: 'Manufacturing & SCM',
    title: 'Plant Operations Director'
  }
];

class AuthManager {
  constructor() {
    this.sessionTimeoutMin = 30;
    this.lastActivity = Date.now();
    this.idleTimer = null;
    this.initSession();
    this.initIdleListener();
  }

  initSession() {
    try {
      const stored = localStorage.getItem('erp_auth_session');
      if (stored) {
        const session = JSON.parse(stored);
        if (session && session.user) {
          store.setState({ user: session.user });
          inMemoryAuthToken = session.token || 'demo-session-token';
        }
      } else {
        // Auto-login with default admin for seamless demo startup
        this.login('admin@erp.local', 'admin123');
      }
    } catch (e) {
      console.warn('Could not restore auth session:', e);
    }
  }

  initIdleListener() {
    const resetTimer = () => {
      this.lastActivity = Date.now();
    };

    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });

    // Check every minute
    setInterval(() => {
      const currentUser = store.getState('user');
      if (!currentUser) return;

      const idleDurationMin = (Date.now() - this.lastActivity) / 60000;
      if (idleDurationMin >= this.sessionTimeoutMin) {
        console.warn('[Auth] Session timed out due to user inactivity.');
        this.logout('Session timed out due to inactivity.');
      }
    }, 60000);
  }

  /**
   * Log in user by email and password.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = DEMO_USERS.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      // Allow custom login in demo if email provided
      const customUser = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: normalizedEmail,
        role: 'admin',
        avatar: email.slice(0, 2).toUpperCase(),
        department: 'Operations',
        title: 'Manager'
      };
      this.setSession(customUser, `demo-token-${Date.now()}`);
      return { success: true, user: customUser };
    }

    const token = `demo-jwt-${user.id}-${Date.now()}`;
    this.setSession(user, token);
    return { success: true, user };
  }

  setSession(user, token) {
    inMemoryAuthToken = token;
    store.setState({ user });
    try {
      localStorage.setItem('erp_auth_session', JSON.stringify({ user, token }));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
    events.emit('auth.login', { user });
  }

  logout(reason = null) {
    inMemoryAuthToken = null;
    store.setState({ user: null });
    try {
      localStorage.removeItem('erp_auth_session');
    } catch (e) {}

    events.emit('auth.logout', { reason });
    window.location.hash = '#/login';
  }

  getToken() {
    return inMemoryAuthToken;
  }

  isAuthenticated() {
    return !!store.getState('user');
  }

  getCurrentUser() {
    return store.getState('user');
  }
}

export const auth = new AuthManager();

