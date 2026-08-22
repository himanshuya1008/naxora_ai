import httpClient from '../api/httpClient.js';

// Public-facing (marketing site Contact/Book Demo forms) — authenticated via
// the tracking API key, matching the same pattern as behaviorTracker.js and
// the public /conversations/start endpoint (no user session exists yet).
export async function createLead(fields) {
  const { data } = await httpClient.post('/leads', fields, {
    headers: { 'x-api-key': import.meta.env.VITE_TRACKING_API_KEY },
  });
  return data.data.lead;
}

// Dashboard-facing.
export async function listLeads(params) {
  const { data } = await httpClient.get('/leads', { params });
  return data.data;
}
