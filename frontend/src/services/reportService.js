import httpClient from '../api/httpClient.js';
import { isDemoMode } from '../utils/demoMode.js';
import { mockReports, mockReportDetail } from './mock/mockData.js';

export async function listReports() {
  try {
    const { data } = await httpClient.get('/reports');
    return data.data.reports;
  } catch (err) {
    // DEV DEMO MODE fallback — see utils/demoMode.js.
    if (isDemoMode) return mockReports;
    throw err;
  }
}

export async function getReport(conversationId) {
  try {
    const { data } = await httpClient.get(`/reports/${conversationId}`);
    return data.data.report;
  } catch (err) {
    if (isDemoMode) return mockReportDetail(conversationId);
    throw err;
  }
}

export async function regenerateReport(conversationId) {
  try {
    const { data } = await httpClient.post(`/reports/${conversationId}/regenerate`);
    return data.data.report;
  } catch (err) {
    if (isDemoMode) return mockReportDetail(conversationId);
    throw err;
  }
}
