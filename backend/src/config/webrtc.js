import { env } from './env.js';

// Served to the frontend via GET /api/voice/ice-servers so TURN credentials
// never need to be hardcoded client-side.
export function getIceServers() {
  const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];

  if (env.TURN_SERVER_URL) {
    iceServers.push({
      urls: env.TURN_SERVER_URL,
      username: env.TURN_SERVER_USERNAME,
      credential: env.TURN_SERVER_CREDENTIAL,
    });
  }

  return iceServers;
}
