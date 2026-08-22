import { create } from 'zustand';
import visitorHttpClient from '../api/visitorHttpClient.js';

// Visitor-side equivalent of authStore.js — deliberately a separate store,
// not a parameterized/shared one, so Visitor and Admin sessions can coexist
// in the same browser tab (independent access tokens in memory, independent
// httpOnly refresh cookies — see visitorAuthController's REFRESH_COOKIE_NAME)
// and so neither flow's logic can accidentally leak into the other's.
const FINGERPRINT_KEY = 'aisip_visitor_fingerprint';

// Registration links the account to any prior anonymous tracking history for
// this browser, if behaviorTracker.js has already created one (same
// localStorage key it uses — see trackingBehavior's getOrCreateFingerprint).
function getStoredFingerprint() {
  try {
    return localStorage.getItem(FINGERPRINT_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export const useVisitorAuthStore = create((set, get) => ({
  visitor: null,
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
    set({ status: 'unauthenticated' });
  },

  async login(email, password) {
    set({ status: 'loading', error: null });
    try {
      const { data } = await visitorHttpClient.post('/visitor-auth/login', { email, password });
      set({ visitor: data.data.visitor, accessToken: data.data.accessToken, status: 'authenticated' });
      return true;
    } catch (err) {
      set({ status: 'unauthenticated', error: err.response?.data?.error?.message ?? 'Login failed' });
      return false;
    }
  },

  async register(fields) {
    set({ status: 'loading', error: null });
    try {
      const { data } = await visitorHttpClient.post('/visitor-auth/register', {
        ...fields,
        fingerprint: getStoredFingerprint(),
      });
      set({ visitor: data.data.visitor, accessToken: data.data.accessToken, status: 'authenticated' });
      return true;
    } catch (err) {
      set({ status: 'unauthenticated', error: err.response?.data?.error?.message ?? 'Registration failed' });
      return false;
    }
  },

  async fetchMe() {
    try {
      const { data } = await visitorHttpClient.get('/visitor-auth/me');
      set({ visitor: data.data.visitor, status: 'authenticated' });
    } catch {
      set({ status: 'unauthenticated' });
    }
  },

  async refreshSession() {
    try {
      const { data } = await visitorHttpClient.post('/visitor-auth/refresh', {});
      set({ accessToken: data.data.accessToken });
      return true;
    } catch {
      return false;
    }
  },

  async logout() {
    try {
      await visitorHttpClient.post('/visitor-auth/logout');
    } catch {
      // ignore — we're clearing local state regardless
    }
    set({ visitor: null, accessToken: null, status: 'unauthenticated' });
  },
}));
