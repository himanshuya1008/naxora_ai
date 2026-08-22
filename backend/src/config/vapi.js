import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Plain fetch-based REST client against Vapi's API — no SDK dependency,
// consistent with elevenLabsService.js's fetch rewrite. Vapi's server-side
// surface is a handful of REST calls; a full SDK isn't worth the dependency
// weight for that.
const VAPI_API_BASE = 'https://api.vapi.ai';

async function vapiRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${VAPI_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    logger.error({ status: response.status, path, data }, 'Vapi API request failed');
    throw new Error(`Vapi API error ${response.status} on ${method} ${path}: ${text}`);
  }

  return data;
}

export function getAssistant(assistantId = env.VAPI_ASSISTANT_ID) {
  return vapiRequest(`/assistant/${assistantId}`);
}

export function updateAssistant(patch, assistantId = env.VAPI_ASSISTANT_ID) {
  return vapiRequest(`/assistant/${assistantId}`, { method: 'PATCH', body: patch });
}

export function getCall(callId) {
  return vapiRequest(`/call/${callId}`);
}
