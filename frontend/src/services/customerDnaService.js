import httpClient from '../api/httpClient.js';
import { isDemoMode } from '../utils/demoMode.js';
import { mockDnaDashboard } from './mock/mockData.js';

// Org-wide aggregate (grade distribution, average scores, top pain points)
// — backed by the existing GET /customer-dna/dashboard route, which has been
// live since the Customer DNA engine shipped but never had a dedicated admin
// page consuming it.
export async function getDnaDashboard() {
  try {
    const { data } = await httpClient.get('/customer-dna/dashboard');
    return data.data;
  } catch (err) {
    if (isDemoMode) return mockDnaDashboard;
    throw err;
  }
}
