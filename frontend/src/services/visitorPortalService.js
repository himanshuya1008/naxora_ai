import visitorHttpClient from '../api/visitorHttpClient.js';

export async function getMyOverview() {
  const { data } = await visitorHttpClient.get('/visitor-portal/overview');
  return data.data;
}

export async function listMyConversations({ page = 1, pageSize = 20 } = {}) {
  const { data } = await visitorHttpClient.get('/visitor-portal/conversations', { params: { page, pageSize } });
  return data.data;
}

export async function getMyConversation(id) {
  const { data } = await visitorHttpClient.get(`/visitor-portal/conversations/${id}`);
  return data.data;
}

export async function listMyLeads({ page = 1, pageSize = 20 } = {}) {
  const { data } = await visitorHttpClient.get('/visitor-portal/leads', { params: { page, pageSize } });
  return data.data;
}

export async function updateMyProfile(fields) {
  const { data } = await visitorHttpClient.patch('/visitor-portal/profile', fields);
  return data.data;
}

export async function changeMyPassword(fields) {
  await visitorHttpClient.post('/visitor-portal/change-password', fields);
}
