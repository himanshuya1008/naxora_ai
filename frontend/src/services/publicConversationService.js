import httpClient from '../api/httpClient.js';

// Public widget-facing (anonymous website visitor) — authenticated via the
// tracking API key, unlike the JWT-authenticated dashboard-start flow used
// by conversationService.startDashboardConversation.
export async function startPublicConversation({ visitorId, sessionId, language }) {
  const payload = { language };
  if (visitorId) payload.visitorId = visitorId;
  if (sessionId) payload.sessionId = sessionId;

  const { data } = await httpClient.post(
    '/conversations/start',
    payload,
    { headers: { 'x-api-key': import.meta.env.VITE_TRACKING_API_KEY } }
  );
  return data.data;
}
