/**
 * Minimal & Elegant Authentication View
 * Mobile-First: Ergonomic touch-friendly inputs, quick demo profile switching.
 */

import { auth, DEMO_USERS } from '../../../core/auth.js';
import { toast } from '../../../components/toast.js';
import { escapeHTML } from '../../../core/sanitize.js';

export default async function LoginView() {
  const container = document.createElement('div');
  container.className = 'min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FAFAFA] dark:bg-[#09090B] select-none';

  container.innerHTML = `
    <div class="w-full max-w-sm bg-white dark:bg-[#0D0D11] rounded-3xl shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6">
      <div class="text-center space-y-2">
        <div class="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg shadow-sm mx-auto">
          ✦
        </div>
        <h1 class="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Enterprise ERP</h1>
        <p class="text-xs text-zinc-400">Sign in to your organization workspace</p>
      </div>

      <form id="form-login" class="space-y-4 text-xs">
        <div>
          <label class="block font-medium mb-1 text-zinc-600 dark:text-zinc-400">Corporate Email</label>
          <input type="email" id="login-email" value="admin@erp.local" required
            class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400" />
        </div>
        <div>
          <label class="block font-medium mb-1 text-zinc-600 dark:text-zinc-400">Password</label>
          <input type="password" id="login-password" value="admin123" required
            class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400" />
        </div>
        <button type="submit" class="w-full py-2.5 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm">
          Sign In
        </button>
      </form>

      <!-- Minimal Demo Accounts Switcher -->
      <div class="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 space-y-2">
        <div class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 text-center">Quick Profile Access</div>
        <div class="grid grid-cols-2 gap-2 text-[11px]">
          ${DEMO_USERS.map(u => `
            <button type="button" data-demo-email="${escapeHTML(u.email)}" class="p-2.5 text-left rounded-xl border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:scale-95 transition-all">
              <div class="font-medium text-zinc-800 dark:text-zinc-200">${escapeHTML(u.name.split(' ')[0])}</div>
              <div class="text-[10px] text-zinc-400 truncate">${escapeHTML(u.department.split(' ')[0])}</div>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  container.querySelector('#form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = container.querySelector('#login-email').value;
    const pass = container.querySelector('#login-password').value;

    const res = await auth.login(email, pass);
    if (res.success) {
      toast.success(`Welcome back, ${res.user.name}!`);
      window.location.hash = '#/dashboard';
    } else {
      toast.error('Invalid credentials');
    }
  });

  container.querySelectorAll('[data-demo-email]').forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-demo-email');
      container.querySelector('#login-email').value = email;
      container.querySelector('#form-login').dispatchEvent(new Event('submit'));
    });
  });

  return container;
}
