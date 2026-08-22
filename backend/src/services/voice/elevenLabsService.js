import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

// Calls ElevenLabs' streaming TTS REST endpoint directly via fetch, rather
// than through the @elevenlabs/elevenlabs-js SDK. That SDK ships as ~20,000
// individual files (Fern-generated); on a filesystem with high per-file I/O
// latency (confirmed 10+ minutes on this project's WSL2 /mnt/c mount, and —
// worse — the mere act of *initiating* the dynamic import blocks the event
// loop synchronously long enough to stall the whole server, not just the
// voice call that triggered it) resolving it even once made the app
// unusable. All this endpoint actually needs is "POST text, stream back
// audio bytes" — Node's built-in fetch does that with zero extra
// dependencies and zero cold-import cost.
const STREAM_URL_BASE = 'https://api.elevenlabs.io/v1/text-to-speech';

/**
 * Streams synthesized speech for `text` as an async-iterable of audio chunks
 * (mp3). Streaming (rather than waiting for the full clip) keeps time-to-
 * first-audio low, which matters for a live voice conversation.
 */
export async function synthesizeSpeechStream(text) {
  try {
    const url = `${STREAM_URL_BASE}/${env.ELEVENLABS_VOICE_ID}/stream?optimize_streaming_latency=3&output_format=mp3_44100_128`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, model_id: env.ELEVENLABS_MODEL_ID }),
    });

    if (!response.ok || !response.body) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`ElevenLabs API error ${response.status}: ${errorBody}`);
    }

    // Node's fetch Response.body is a WHATWG ReadableStream, which supports
    // `for await...of` natively — no extra conversion needed by the caller.
    return response.body;
  } catch (err) {
    logger.error({ err }, 'ElevenLabs speech synthesis failed');
    throw err;
  }
}
