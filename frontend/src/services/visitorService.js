import httpClient from '../api/httpClient.js';
import { isDemoMode } from '../utils/demoMode.js';
import { mockVisitors, mockVisitorDetail } from './mock/mockData.js';

export async function listVisitors(params) {
  try {
    const { data } = await httpClient.get('/visitors', { params });
    return data.data;
  } catch (err) {
    // DEV DEMO MODE fallback — see utils/demoMode.js. Respects the same
    // decisionStage filter the dashboard's stage tabs pass in, so filtering
    // still behaves sensibly against the mock rows.
    if (isDemoMode) {
      const visitors = params?.decisionStage
        ? mockVisitors.filter((v) => v.decisionStage === params.decisionStage)
        : mockVisitors;
      return { visitors };
    }
    throw err;
  }
}

export async function getVisitor(id) {
  try {
    const { data } = await httpClient.get(`/visitors/${id}`);
    return data.data;
  } catch (err) {
    if (isDemoMode) return mockVisitorDetail(id);
    throw err;
  }
}

export async function getVisitorDnaHistory(id) {
  const { data } = await httpClient.get(`/visitors/${id}/dna-history`);
  return data.data.history;
}
