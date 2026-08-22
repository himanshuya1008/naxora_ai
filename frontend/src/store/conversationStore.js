import { create } from 'zustand';

const INITIAL_SCORES = {
  interestScore: 0,
  trustScore: 50,
  buyingProbability: 0,
  engagementScore: 0,
  objectionCount: 0,
  leadGrade: 'C',
  intentTier: 'DISCOVERY',
  leadLabel: '🔍 Discovery Lead',
  isHighLead: false,
};

export const useConversationStore = create((set, get) => ({
  status: 'idle', // idle | connecting | active | ended | error
  conversationId: null,
  transcript: [], // { role, text, final, strategy }
  scores: INITIAL_SCORES,
  objections: [],
  liveDna: null,
  detectedSignals: [],
  aiSpeaking: false,
  // Fine-grained voice-activity state for the live-call UI, distinct from
  // `status` (connection lifecycle): idle | listening | thinking | speaking.
  // Driven entirely by vapiCallController.js's 'voice-status' event.
  voiceStatus: 'idle',
  // Set once, the instant status first becomes 'active' — read by
  // CallDuration.jsx to render a live MM:SS timer without this value itself
  // ticking every second (that would re-render everything subscribed to the
  // store once a second for no reason; the timer component ticks locally).
  callStartedAt: null,
  errorMessage: null,
  // True when the AI itself detected a natural goodbye and closed the call
  // (Smart Conversation Ending), as opposed to the visitor hanging up or an
  // error — read by AIConsultant.jsx to decide whether to show the post-call
  // "Stay Connected" prompt. Set via the 'smart-ending' controller event,
  // which is only emitted from inside the real 'call-end' handler — i.e.
  // once the call has actually, fully ended (closing line included), never
  // while the assistant is still speaking. Co-emitted with 'conversation-ended'
  // in the same synchronous tick, so this and `status` becoming 'ended' are
  // never observed out of sync by a React render.
  endedNaturally: false,

  reset() {
    set({
      status: 'idle',
      conversationId: null,
      transcript: [],
      scores: INITIAL_SCORES,
      objections: [],
      liveDna: null,
      detectedSignals: [],
      aiSpeaking: false,
      voiceStatus: 'idle',
      callStartedAt: null,
      errorMessage: null,
      endedNaturally: false,
    });
  },

  setStatus(status) {
    set((state) => ({
      status,
      callStartedAt: status === 'active' && !state.callStartedAt ? Date.now() : state.callStartedAt,
    }));
  },

  setConversationId(conversationId) {
    set({ conversationId });
  },

  // Replaces the in-progress (non-final) line for a role as new partial
  // transcripts arrive, instead of appending a new bubble per update —
  // applies to BOTH roles equally, so a streaming assistant reply renders as
  // one growing bubble rather than one bubble per partial chunk. A final
  // entry for a role also replaces that role's pending partial (if any),
  // then becomes permanent.
  pushTranscript(entry) {
    set((state) => {
      const withoutPendingPartial = state.transcript.filter((t) => !(t.role === entry.role && !t.final));
      return { transcript: [...withoutPendingPartial, entry] };
    });
  },

  updateScores(scores) {
    set((state) => ({ scores: { ...state.scores, ...scores } }));
  },

  setLiveDna(liveDna) {
    set({ liveDna });
  },

  setDetectedSignals(detectedSignals) {
    set({ detectedSignals });
  },

  addObjection(objection) {
    set((state) => {
      const alreadyExists = state.objections.some((o) => o.type === objection.type);
      if (alreadyExists) return state;
      return { objections: [...state.objections, objection] };
    });
  },

  setAiSpeaking(aiSpeaking) {
    set({ aiSpeaking });
  },

  setVoiceStatus(voiceStatus) {
    set({ voiceStatus });
  },

  setEndedNaturally() {
    set({ endedNaturally: true });
  },

  setError(errorMessage) {
    let msg = errorMessage;
    if (msg instanceof Error) {
      msg = msg.message;
    } else if (typeof msg === 'object' && msg !== null) {
      msg = msg.message || msg.error || msg.errorMsg || JSON.stringify(msg);
    }
    set({ status: 'error', voiceStatus: 'idle', errorMessage: msg || 'An unexpected error occurred' });
  },

  // Non-fatal — unlike setError, deliberately does NOT touch `status`. Used
  // for the mic-silence warning (see vapiCallController.js's
  // MIC_SILENCE_CHECK_MS): the call is still technically live on Vapi's side
  // at the point this fires, so flipping status to 'error' would show
  // "Error" over a call that hasn't actually ended yet — this just informs
  // the visitor via the same ErrorBanner while the call continues normally.
  setWarning(message) {
    let msg = message;
    if (msg instanceof Error) {
      msg = msg.message;
    } else if (typeof msg === 'object' && msg !== null) {
      msg = msg.message || msg.error || msg.errorMsg || JSON.stringify(msg);
    }
    set({ errorMessage: msg });
  },

  getSnapshot: () => get(),
}));
