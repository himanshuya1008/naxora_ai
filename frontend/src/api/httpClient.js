import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const httpClient = axios.create({
  baseURL,
  withCredentials: true, // send the httpOnly refresh-token cookie
});

httpClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (response?.status !== 401 || config._retried || config.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    config._retried = true;

    // De-duplicate concurrent 401s into a single in-flight refresh call.
    refreshPromise ??= useAuthStore
      .getState()
      .refreshSession()
      .finally(() => {
        refreshPromise = null;
      });

    const refreshed = await refreshPromise;
    if (!refreshed) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    return httpClient(config);
  }
);

export default httpClient;
