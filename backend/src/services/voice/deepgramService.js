import { LiveTranscriptionEvents } from '@deepgram/sdk';
import { deepgram } from '../../config/deepgram.js';
import { logger } from '../../utils/logger.js';

// Deepgram's live API closes idle connections after a short silence window
// with no audio/keep-alive traffic. Pinging well under that window keeps the
// socket alive through natural pauses in the visitor's speech.
const KEEP_ALIVE_INTERVAL_MS = 6_000;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BASE_DELAY_MS = 500;

const LIVE_OPTIONS = {
  model: 'nova-2',
  language: 'en-US',
  smart_format: true,
  interim_results: true,
  endpointing: 300, // ms of silence before Deepgram flags an utterance boundary
  utterance_end_ms: 1000,
  vad_events: true,
  encoding: 'linear16',
  sample_rate: 16000,
  channels: 1,
};

/**
 * Opens a Deepgram live-transcription websocket for one conversation turn
 * stream. Caller owns the connection lifecycle (created per Socket.IO
 * connection, torn down when the visitor's mic stream ends).
 *
 * Transparently reconnects on an unexpected error/close (bounded retries with
 * backoff) so a transient network blip or Deepgram's idle-close doesn't kill
 * the whole call — `onError` (the caller's fatal path) only fires once
 * reconnect attempts are exhausted. `sendAudio`/`close` are stable across
 * reconnects; the caller never needs to know a swap happened.
 */
export function openLiveTranscription({ onTranscript, onUtteranceEnd, onError }) {
  let connection = null;
  let keepAliveInterval = null;
  let reconnectAttempts = 0;
  let reconnecting = false;
  let intentionallyClosed = false;

  function clearKeepAlive() {
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }

  function handleUnexpectedClose(err) {
    if (intentionallyClosed || reconnecting) return;
    clearKeepAlive();

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts += 1;
      reconnecting = true;
      const delay = RECONNECT_BASE_DELAY_MS * reconnectAttempts;
      logger.warn({ err: describeError(err), attempt: reconnectAttempts }, 'Deepgram connection lost, attempting reconnect');
      setTimeout(connect, delay);
    } else {
      logger.error({ err: describeError(err) }, 'Deepgram reconnect attempts exhausted');
      onError?.(err ?? new Error('Deepgram connection closed'));
    }
  }

  // Pulls out whatever diagnostic detail the underlying transport actually
  // gives us. A raw HTTP status is only available here if the failure came
  // through as a `ws` "unexpected-response"-shaped error; Node's native
  // WebSocket (the buggy fallback this module's `ws`-client override avoids)
  // deliberately hides that detail entirely, which is why unpatched setups
  // only ever see a generic "network error or non-101 status code".
  function describeError(err) {
    return {
      message: err?.message,
      code: err?.code,
      status: err?.status ?? err?.statusCode ?? err?.response?.status,
      body: err?.response?.data ?? err?.error,
      type: err?.type,
    };
  }

  function connect() {
    logger.debug({ options: LIVE_OPTIONS }, 'Opening Deepgram live transcription connection...');
    connection = deepgram.listen.live(LIVE_OPTIONS);

    connection.on(LiveTranscriptionEvents.Open, () => {
      logger.info('Deepgram live transcription connection opened successfully');
      reconnectAttempts = 0;
      reconnecting = false;
      clearKeepAlive();
      keepAliveInterval = setInterval(() => connection?.keepAlive(), KEEP_ALIVE_INTERVAL_MS);
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const alternative = data.channel?.alternatives?.[0];
      if (!alternative?.transcript) return;
      onTranscript({
        text: alternative.transcript,
        isFinal: data.is_final,
        speechFinal: data.speech_final,
        confidence: alternative.confidence,
      });
    });

    connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
      onUtteranceEnd?.();
    });

    connection.on(LiveTranscriptionEvents.Error, (err) => {
      logger.error({ err: describeError(err) }, 'Deepgram live transcription error');
      handleUnexpectedClose(err);
    });

    connection.on(LiveTranscriptionEvents.Close, (event) => {
      logger.debug({ event: describeError(event) }, 'Deepgram live transcription connection closed');
      handleUnexpectedClose(event);
    });
  }

  connect();

  return {
    sendAudio: (chunk) => connection?.send(chunk),
    close: () => {
      logger.debug('Closing Deepgram live transcription connection (intentional)');
      intentionallyClosed = true;
      clearKeepAlive();
      connection?.requestClose();
    },
  };
}
