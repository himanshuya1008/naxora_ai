import httpClient from '../api/httpClient.js';
import { isDemoMode } from '../utils/demoMode.js';
import { mockOrganization, mockTeam, mockApiKeys } from './mock/mockData.js';

function fakeApiKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `pk_demo_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

export async function getOrganization() {
  try {
    const { data } = await httpClient.get('/organization');
    return data.data.organization;
  } catch (err) {
    // DEV DEMO MODE fallback — see utils/demoMode.js. Every organization
    // action below simulates success against the in-memory mock fixtures
    // rather than persisting anywhere, since there's no backend to persist to.
    if (isDemoMode) return mockOrganization;
    throw err;
  }
}

export async function updateOrganization(fields) {
  try {
    const { data } = await httpClient.patch('/organization', fields);
    return data.data.organization;
  } catch (err) {
    if (isDemoMode) return { ...mockOrganization, ...fields };
    throw err;
  }
}

export async function listTeamMembers() {
  try {
    const { data } = await httpClient.get('/organization/team');
    return data.data.users;
  } catch (err) {
    if (isDemoMode) return mockTeam;
    throw err;
  }
}

export async function listApiKeys() {
  try {
    const { data } = await httpClient.get('/organization/api-keys');
    return data.data.apiKeys;
  } catch (err) {
    if (isDemoMode) return mockApiKeys;
    throw err;
  }
}

export async function createApiKey(label, type = 'TRACKING_PUBLIC') {
  try {
    const { data } = await httpClient.post('/organization/api-keys', { label, type });
    return data.data.apiKey;
  } catch (err) {
    if (isDemoMode) {
      return { id: `demo-key-${Date.now()}`, label, key: fakeApiKey(), createdAt: new Date().toISOString(), revokedAt: null };
    }
    throw err;
  }
}

export async function revokeApiKey(id) {
  try {
    await httpClient.delete(`/organization/api-keys/${id}`);
  } catch (err) {
    if (isDemoMode) return;
    throw err;
  }
}
