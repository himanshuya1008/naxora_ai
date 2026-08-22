import { useCallback, useRef } from 'react';
import { VapiCallController } from '../services/voice/vapiCallController.js';
import { startPublicConversation } from '../services/publicConversationService.js';
import { useConversationStore } from '../store/conversationStore.js';
import { getSelectedLanguage } from '../services/voice/languagePreference.js';

// Mirrors hooks/useVoiceCall.js exactly, except it starts the conversation
// via the public, API-key-authenticated /conversations/start endpoint
// (anonymous website visitor) instead of the JWT-authenticated dashboard flow.
export function usePublicVoiceCall() {
  const voiceSocketRef = useRef(null);
  const unsubscribersRef = useRef([]);
  const store = useConversationStore();

  const cleanupCurrent = useCallback(() => {
    unsubscribersRef.current.forEach((off) => off());
    unsubscribersRef.current = [];
    voiceSocketRef.current?.disconnect();
    voiceSocketRef.current = null;
  }, []);

  const start = useCallback(
    async ({ visitorId, sessionId }) => {
      // A previous call (active or still connecting) must be torn down
      // before starting a new one — otherwise two Vapi/Daily sessions can
      // exist at once, each holding the mic and playing audio, i.e. exactly
      // the "overlapping audio" failure mode.
      cleanupCurrent();

      store.reset();
      store.setStatus('connecting');

      try {
        const { conversation, vapiPublicKey, assistantId, assistantOverrides } = await startPublicConversation({
          visitorId,
          sessionId,
          language: getSelectedLanguage(),
        });
        store.setConversationId(conversation.id);

        const voiceSocket = new VapiCallController({ vapiPublicKey, assistantId, assistantOverrides });
        voiceSocketRef.current = voiceSocket;

        unsubscribersRef.current = [
          voiceSocket.on('transcript', (entry) => store.pushTranscript(entry)),
          voiceSocket.on('scores-update', (scores) => store.updateScores(scores)),
          voiceSocket.on('live-dna', (dna) => store.setLiveDna(dna)),
          voiceSocket.on('detected-signals', (signals) => store.setDetectedSignals(signals)),
          voiceSocket.on('objection-detected', (objection) => store.addObjection(objection)),
          voiceSocket.on('ai-speaking', (speaking) => store.setAiSpeaking(speaking)),
          voiceSocket.on('voice-status', (voiceStatus) => store.setVoiceStatus(voiceStatus)),
          voiceSocket.on('smart-ending', () => store.setEndedNaturally()),
          voiceSocket.on('conversation-ended', () => store.setStatus('ended')),
          voiceSocket.on('error', (err) => {
            const msg = typeof err === 'string' ? err : err?.message || err?.error || JSON.stringify(err);
            store.setError(msg);
          }),
          voiceSocket.on('mic-silent-warning', () =>
            store.setWarning("We're not receiving any audio from your microphone. Check that it's connected and that this site has permission to use it.")
          ),
        ];

        await voiceSocket.connect();
        store.setStatus('active');
      } catch (err) {
        const msg =
          err?.response?.data?.error?.message ||
          (typeof err?.message === 'string' ? err.message : null) ||
          (typeof err === 'string' ? err : null) ||
          'Failed to start the conversation. Please check your Vapi API keys in settings.';
        store.setError(msg);
      }
    },
    [store, cleanupCurrent]
  );

  const end = useCallback(() => {
    voiceSocketRef.current?.endCall();
    cleanupCurrent();
    store.reset();
  }, [cleanupCurrent, store]);

  const disconnect = useCallback(() => {
    cleanupCurrent();
    store.reset();
  }, [cleanupCurrent, store]);

  return { start, end, disconnect, voiceSocketRef };
}
