import { create } from 'zustand';
import httpClient from '../api/httpClient.js';
import { isDemoMode } from '../utils/demoMode.js';

// Matches backend/prisma/seed.js's seeded demo account — the same
// credentials already used to exercise this API throughout development.
// Only ever used when isDemoMode is true (dev-only, see demoMode.js).
const DEMO_EMAIL = 'demo@acme.test';
const DEMO_PASSWORD = 'Demo1234!';

// Access token lives in memory only (never localStorage) — the refresh token
// is an httpOnly cookie the browser can't read, so an XSS payload can steal
// at most the short-lived access token, not a long-lived credential.
export const useAuthStore = create((set, get) => ({
  user: null,
  organization: null,
  accessToken: null,
  status: 'idle', // idle | loading | authenticated | unauthenticated
  error: null,

  async bootstrap() {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    const refreshed = await get().refreshSession();
    if (refreshed) {
      await get().fetchMe();
      return;
    }

    // ProtectedRoute renders the dashboard immediately in demo mode without
    // waiting on `status` — but that only bypasses the ROUTE GUARD, not the
    // backend's own auth. Every real API call (starting a voice call, e.g.)
    // still requires a genuine JWT via the `protect` middleware, which this
    // dev-only demo account provides. Without this, demo mode showed a fully
    // chromed dashboard with a null access token, so anything requiring real
    // auth — like POST /conversations/dashboard-start — correctly 401'd the
    // moment it was used, even though the UI never indicated a login was
    // needed. This performs a REAL login (not a mock), so every dashboard
    // action actually works in demo mode instead of only its static chrome.
    if (isDemoMode) {
      const loggedIn = await get().login(DEMO_EMAIL, DEMO_PASSWORD);
      if (loggedIn) return;
    }

    set({ status: 'unauthenticated' });
  },

  async login(email, password) {
    set({ status: 'loading', error: null });
    try {
      const { data } = await httpClient.post('/auth/login', { email, password });
      set({ user: data.data.user, accessToken: data.data.accessToken, status: 'authenticated' });
      return true;
    } catch (err) {
      set({ status: 'unauthenticated', error: err.response?.data?.error?.message ?? 'Login failed' });
      return false;
    }
  },

  async register(fields) {
    set({ status: 'loading', error: null });
    try {
      const { data } = await httpClient.post('/auth/register', fields);
      set({
        user: data.data.user,
        organization: data.data.organization,
        accessToken: data.data.accessToken,
        status: 'authenticated',
      });
      return true;
    } catch (err) {
      set({ status: 'unauthenticated', error: err.response?.data?.error?.message ?? 'Registration failed' });
      return false;
    }
  },

  async fetchMe() {
    try {
      const { data } = await httpClient.get('/auth/me');
      set({ user: data.data.user, status: 'authenticated' });
    } catch {
      set({ status: 'unauthenticated' });
    }
  },

  async refreshSession() {
    try {
      // Explicit {} body: with no body at all, axios sends no Content-Type
      // header, so express.json() never runs and req.body stays undefined —
      // which fails Zod's object-schema validation on the backend route.
      const { data } = await httpClient.post('/auth/refresh', {});
      set({ accessToken: data.data.accessToken });
      return true;
    } catch {
      return false;
    }
  },

  async logout() {
    try {
      await httpClient.post('/auth/logout');
    } catch {
      // ignore — we're clearing local state regardless
    }
    set({ user: null, organization: null, accessToken: null, status: 'unauthenticated' });
  },
}));
