import axios from 'axios';
import { useVisitorAuthStore } from '../store/visitorAuthStore.js';

// Deliberately a SEPARATE axios instance from httpClient.js, not a shared
// one — that client's interceptor reads useAuthStore (admin) and would
// silently attach the admin's bearer token to visitor requests whenever an
// admin session also exists in the same browser, breaking the "completely
// separate auth flows" requirement. This one reads useVisitorAuthStore only.
const visitorHttpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // send the httpOnly visitor refresh-token cookie
});

visitorHttpClient.interceptors.request.use((config) => {
  const { accessToken } = useVisitorAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

visitorHttpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (response?.status !== 401 || config._retried || config.url?.includes('/visitor-auth/refresh')) {
      return Promise.reject(error);
    }

    config._retried = true;

    refreshPromise ??= useVisitorAuthStore
      .getState()
      .refreshSession()
      .finally(() => {
        refreshPromise = null;
      });

    const refreshed = await refreshPromise;
    if (!refreshed) {
      useVisitorAuthStore.getState().logout();
      return Promise.reject(error);
    }

    return visitorHttpClient(config);
  }
);

export default visitorHttpClient;
