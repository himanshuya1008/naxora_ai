import httpClient from '../api/httpClient.js';
import { isDemoMode } from '../utils/demoMode.js';
import { mockConversationDetail } from './mock/mockData.js';

export async function startDashboardConversation(visitorId, language) {
  const { data } = await httpClient.post('/conversations/dashboard-start', { visitorId, language });
  return data.data;
}

export async function endDashboardConversation(conversationId) {
  const { data } = await httpClient.post(`/conversations/${conversationId}/dashboard-end`);
  return data.data;
}

export async function listConversations(params) {
  const { data } = await httpClient.get('/conversations', { params });
  return data.data;
}

export async function getConversation(id) {
  try {
    const { data } = await httpClient.get(`/conversations/${id}`);
    return data.data;
  } catch (err) {
    // DEV DEMO MODE fallback — see utils/demoMode.js. Only the transcript
    // read path falls back; live voice call start/end still requires a real
    // backend (Deepgram/ElevenLabs), which is out of scope for demo mode.
    if (isDemoMode) return mockConversationDetail(id);
    throw err;
  }
}
