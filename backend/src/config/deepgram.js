import WS from 'ws';
import { createClient } from '@deepgram/sdk';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Node.js 20+ ships a native global `WebSocket` (browser-style, WHATWG API).
// @deepgram/sdk's transport auto-detection (`typeof WebSocket !== 'undefined'`)
// was written before that existed, so on modern Node it silently mistakes the
// server process for a browser and switches to browser-style auth (the API
// key sent as a WebSocket subprotocol, no custom headers) instead of the `ws`
// package + `Authorization: Token <key>` header this backend needs. That
// mismatch is what produces the generic, unhelpful "network error or non-101
// status code" — it's Node's native WebSocket's error wording, not `ws`'s.
// Forcing the real `ws` client here bypasses that detection bug entirely.
export const deepgram = createClient(env.DEEPGRAM_API_KEY, {
  global: { websocket: { client: WS } },
});

// Verifies the API key against Deepgram's REST API once at boot, so an
// invalid/misconfigured key (e.g. a Project/Key ID copied instead of the
// actual secret key value) surfaces immediately and loudly in the logs with
// the real HTTP status — instead of only being discovered when a visitor
// starts a live voice call and the WebSocket handshake silently fails.
export async function verifyDeepgramCredentials() {
  logger.info('Verifying Deepgram API key...');
  try {
    const res = await fetch('https://api.deepgram.com/v1/projects', {
      headers: { Authorization: `Token ${env.DEEPGRAM_API_KEY}` },
    });
    if (res.ok) {
      logger.info({ status: res.status }, 'Deepgram API key verified successfully');
      return true;
    }
    const body = await res.text();
    logger.error(
      { status: res.status, body },
      'Deepgram API key rejected — live transcription will fail until this is fixed. ' +
        'Double-check you copied the actual API KEY (secret, shown once at creation) from the Deepgram console, ' +
        'not the Key ID/Project ID (a UUID shown in the keys list).'
    );
    return false;
  } catch (err) {
    logger.error({ err }, 'Could not reach Deepgram to verify the API key (network issue, not a credentials problem)');
    return false;
  }
}
