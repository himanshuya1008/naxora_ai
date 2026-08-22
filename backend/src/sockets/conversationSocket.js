import { processTurn } from '../ai/conversationBrain/brain.js';
import { CONVERSATION_START_MARKER } from '../ai/conversationBrain/prompts.js';
import { openLiveTranscription, createSilenceTimer, recordSilenceCheckIn, speak as speakText } from '../services/voice/voiceService.js';
import { endConversation } from '../services/conversationService.js';
import { logger } from '../utils/logger.js';

const SILENCE_TIMEOUT_MS = 10_000;

export function registerConversationHandlers(io, socket) {
  const { conversationId, organizationId } = socket.data;

  let finalTranscriptBuffer = '';
  let ended = false;

  const log = logger.child({ conversationId });

  async function speak(text) {
    try {
      await speakText(text, (chunk) => socket.emit('ai-audio-chunk', chunk));
      socket.emit('ai-audio-end');
    } catch (err) {
      log.error({ err }, 'Text-to-speech failed; client still has the text transcript');
      socket.emit('error', { code: 'TTS_FAILED', message: 'Voice synthesis failed, showing text only.' });
    }
  }

  async function handleSilenceTimeout() {
    if (ended) return;
    try {
      const phrase = await recordSilenceCheckIn(conversationId);
      socket.emit('transcript', { role: 'ai', text: phrase, strategy: 'SILENCE_CHECK_IN' });
      await speak(phrase);
      silenceTimer.arm();
    } catch (err) {
      log.error({ err }, 'Silence check-in failed');
    }
  }

  const silenceTimer = createSilenceTimer({ timeoutMs: SILENCE_TIMEOUT_MS, onTimeout: handleSilenceTimeout });

  async function handleVisitorUtterance(text) {
    if (ended || !text.trim()) return;
    silenceTimer.clear();

    try {
      socket.emit('transcript', { role: 'visitor', text, final: true });

      const { turn, scores } = await processTurn({ conversationId, visitorText: text });

      socket.emit('transcript', { role: 'ai', text: turn.response, strategy: turn.strategy });
      socket.emit('scores-update', scores);
      if (turn.objectionDetected) {
        socket.emit('objection-detected', turn.objectionDetected);
      }

      await speak(turn.response);

      if (turn.strategy === 'END_CONVERSATION') {
        await gracefullyEndConversation();
        return;
      }

      silenceTimer.arm();
    } catch (err) {
      log.error({ err }, 'Failed to process visitor utterance');
      socket.emit('error', { code: 'BRAIN_FAILED', message: 'Something went wrong processing that — please try again.' });
      silenceTimer.arm();
    }
  }

  async function gracefullyEndConversation() {
    if (ended) return;
    ended = true;
    silenceTimer.clear();
    try {
      const conversation = await endConversation({ organizationId, conversationId });
      socket.emit('conversation-ended', { conversation });
    } catch (err) {
      log.error({ err }, 'Failed to end conversation gracefully');
    } finally {
      deepgramConnection.close();
      socket.disconnect(true);
    }
  }

  const deepgramConnection = openLiveTranscription({
    onTranscript: ({ text, isFinal, speechFinal }) => {
      if (!text) return;
      silenceTimer.arm();

      if (isFinal) {
        finalTranscriptBuffer = `${finalTranscriptBuffer} ${text}`.trim();
        socket.emit('transcript', { role: 'visitor', text: finalTranscriptBuffer, final: false });
      } else {
        socket.emit('transcript', { role: 'visitor', text: `${finalTranscriptBuffer} ${text}`.trim(), final: false, interim: true });
      }

      if (speechFinal && finalTranscriptBuffer) {
        const utterance = finalTranscriptBuffer;
        finalTranscriptBuffer = '';
        handleVisitorUtterance(utterance);
      }
    },
    onUtteranceEnd: () => {
      if (finalTranscriptBuffer) {
        const utterance = finalTranscriptBuffer;
        finalTranscriptBuffer = '';
        handleVisitorUtterance(utterance);
      }
    },
    onError: (err) => {
      log.error({ err }, 'Deepgram connection error');
      socket.emit('error', { code: 'STT_FAILED', message: 'Speech recognition connection dropped.' });
    },
  });

  socket.on('audio-chunk', (chunk) => {
    deepgramConnection.sendAudio(chunk);
  });

  socket.on('manual-end', () => {
    gracefullyEndConversation();
  });

  socket.on('disconnect', async () => {
    log.info('Voice socket disconnected');
    deepgramConnection.close();
    silenceTimer.clear();
    if (!ended) {
      ended = true;
      try {
        await endConversation({ organizationId, conversationId });
      } catch (err) {
        log.error({ err }, 'Failed to end conversation on disconnect');
      }
    }
  });

  // Kick off the call with a behavior-aware opening line instead of a generic greeting.
  processTurn({ conversationId, visitorText: CONVERSATION_START_MARKER })
    .then(async ({ turn, scores }) => {
      socket.emit('transcript', { role: 'ai', text: turn.response, strategy: turn.strategy });
      socket.emit('scores-update', scores);
      await speak(turn.response);
      silenceTimer.arm();
    })
    .catch((err) => {
      log.error({ err }, 'Failed to generate opening line');
      socket.emit('error', { code: 'BRAIN_FAILED', message: 'Failed to start the conversation.' });
    });
}
