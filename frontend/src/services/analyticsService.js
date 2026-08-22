import httpClient from '../api/httpClient.js';
import { isDemoMode } from '../utils/demoMode.js';
import { mockOverview, mockTrends, mockLeadAnalytics } from './mock/mockData.js';

export async function getOverview() {
  try {
    const { data } = await httpClient.get('/analytics/overview');
    return data.data;
  } catch (err) {
    // DEV DEMO MODE fallback — only triggers when the real request fails,
    // and only in a dev build with VITE_DEMO_MODE on (see utils/demoMode.js).
    if (isDemoMode) return mockOverview;
    throw err;
  }
}

export async function getTrends(days = 30) {
  try {
    const { data } = await httpClient.get('/analytics/trends', { params: { days } });
    return data.data;
  } catch (err) {
    if (isDemoMode) return mockTrends(days);
    throw err;
  }
}

export async function getLeadAnalytics() {
  try {
    const { data } = await httpClient.get('/analytics/leads');
    return data.data;
  } catch (err) {
    if (isDemoMode) return mockLeadAnalytics;
    throw err;
  }
}
