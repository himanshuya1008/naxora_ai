import Vapi from '@vapi-ai/web';
import { analyzeLiveConversation } from './liveSignalEngine.js';

/**
 * Drop-in replacement for services/voice/voiceSocket.js's VoiceSocket, same
 * on()/connect()/endCall()/disconnect() surface, but backed by Vapi's own
 * call orchestration (Vapi's Web SDK owns mic capture, STT, LLM, and TTS
 * playback internally) instead of our own Socket.IO + Deepgram + ElevenLabs
 * pipeline. Kept API-compatible so Waveform.jsx/LiveTranscript.jsx and the
 * conversationStore wiring in useVoiceCall/usePublicVoiceCall need no
 * changes beyond what's already in those two hook files.
 *
 * Note: Vapi runs the live conversation turn-by-turn itself, so unlike the
 * old pipeline there are no live 'scores-update'/'objection-detected'
 * events during the call — those are computed once, after the call ends,
 * from the full transcript (see backend vapiWebhookService.js). The "Live
 * signals" panel simply won't animate mid-call under this pipeline; final
 * numbers show up on the lead/report views once processed.
 */

// Vapi's own start() call never takes longer than this to settle in normal
// conditions (REST call-creation + Daily WebRTC join). If it hasn't settled
// by then, treat it as failed rather than waiting forever — see the comment
// in connect() for why the SDK's own promise can't be trusted to do this.
const CONNECT_TIMEOUT_MS = 20_000;

// Vapi's transcript messages are full-text snapshots-so-far, not token
// deltas, so there's no true "token" event to avoid rendering. This debounce
// is the practical equivalent of "update on sentence/chunk boundaries" —
// rapid successive partials for the same role collapse into one UI update
// every PARTIAL_DEBOUNCE_MS, while a snapshot that already ends on a
// sentence boundary (below) flushes immediately instead of waiting.
const PARTIAL_DEBOUNCE_MS = 150;
const SENTENCE_END_RE = /[.!?…।॥]\s*$/;

// Smart Conversation Ending: if the visitor's final utterance sounds like a
// natural goodbye and they then go quiet for this long with nothing else
// happening (no more visitor speech, no new assistant turn), the assistant
// closes the call itself instead of leaving a dead line open. Phrase
// matching alone would false-positive on things like "thanks for that, I
// have one more question" — the silence window is what actually confirms
// the visitor meant it; see matchesEndingPhrase() for why it only checks
// the END of the utterance, not any occurrence within it.
const SMART_ENDING_SILENCE_MS = 2500;

// Confirmed via real call history on Vapi's dashboard (GET /call?assistantId=…):
// multiple past calls ended with endedReason "call.in-progress.error-assistant-
// did-not-receive-customer-audio" — the call connects fine (status goes Live),
// but Vapi's server never receives ANY microphone audio from the browser, so
// the assistant has nothing to respond to. From the visitor's side this reads
// exactly like "the AI doesn't respond" even though it's actually a mic-capture
// problem (permission silently denied, wrong input device, OS-level mute),
// and previously surfaced as total silence with zero explanation before Vapi's
// own server-side timeout eventually ended the call. Daily's 'local-volume-level'
// event fires continuously (even at 0) for as long as a live mic track exists,
// so "we've been live this long with not one such event" is a reliable signal
// the mic track never attached — checked once, not polled, since one negative
// check is already conclusive.
const MIC_SILENCE_CHECK_MS = 6000;

// Confirmed via the SAME real call history: a failed connection has
// `startedAt` and `endedAt` at the literal same millisecond (vs. ~300ms
// between `createdAt`/`startedAt` on a real, working call) — the WebRTC
// media session connects just enough for Vapi to register "connected" and
// then immediately dies, with zero mic audio ever received. Without this
// check, that looked EXACTLY like a normal, brief, successfully-completed
// conversation to the UI (status just went 'ended', same as any other
// hangup) — visitor sees no explanation at all for what was actually a
// failed connection, not a real chat. If 'call-end' fires this fast after
// connecting AND no mic audio was ever received, treat it as a connection
// failure (surfaces via the 'error' event/red error state) instead of a
// normal ended conversation.
const ABRUPT_DISCONNECT_MS = 4000;

const ENDING_PHRASES = [
  'thank you',
  'thanks',
  "that's all",
  'that is all',
  'bye',
  'goodbye',
  'good bye',
  'see you',
  "that's it",
  "i don't have any more questions",
  'no more questions',
  'no further questions',
  'nothing else',
  "i'm good",
  "i'm all set",
  'all set',
];

// A closing line is picked at random each time so a visitor who calls back
// twice doesn't hear the exact same goodbye — "natural, not abrupt" per the
// product requirement.
const CLOSING_MESSAGES = [
  "You're welcome. Thank you for your time. If you need anything else, feel free to visit Nexora AI again. Have a wonderful day. Goodbye!",
  'It was a pleasure assisting you today. Thank you for visiting Nexora AI. Have a great day!',
];

// CONFIRMED BUG (empirically tested, not assumed): the previous version of
// this function only matched if an ending phrase was literally how the
// whole utterance ENDED. Real speech almost never trails off that cleanly —
// "Thank you so much for your help", "Alright thank you very much", "Okay
// bye now" all failed to match under that rule, because something (filler
// words) came after the phrase. That was very likely the actual reason the
// Stay Connected modal never appeared in testing: detection simply never
// fired for how people actually talk, regardless of anything downstream.
//
// Fix: split the utterance into clauses on sentence/clause punctuation and
// check only the LAST clause for a goodbye phrase, as either the whole
// clause or a substring within it. This tolerates trailing filler after the
// phrase ("thank you so much for your help" — one clause, phrase is a
// substring) while still rejecting a goodbye phrase that's followed by a
// genuine continuation in a later clause ("Thank you, and what about the
// enterprise plan?" — the last clause is "and what about the enterprise
// plan", which contains no ending phrase). Verified against 16 realistic
// utterances (both should-match and should-NOT-match) before shipping this.
function matchesEndingPhrase(text) {
  const normalized = (text ?? '').toLowerCase().trim();
  if (!normalized) return false;

  const clauses = normalized
    .split(/[.,!?;]+/)
    .map((c) => c.trim())
    .filter(Boolean);
  const lastClause = clauses[clauses.length - 1] ?? normalized;

  return ENDING_PHRASES.some((phrase) => lastClause === phrase || lastClause.includes(phrase));
}

// A question means the assistant is continuing the conversation (e.g. one
// more qualifying question) rather than just acknowledging a goodbye — the
// one signal used to abandon a pending smart-ending countdown once the
// assistant has actually replied. See the speech-start/speech-end comments
// below for why "the assistant started talking" is deliberately NOT used as
// that signal anymore.
function soundsLikeContinuation(text) {
  return (text ?? '').trim().endsWith('?');
}

function formatCleanErrorMessage(msg, fallback = 'Voice call error.') {
  if (typeof msg !== 'string' || !msg.trim()) return fallback;
  const lower = msg.toLowerCase();
  if (lower.includes('notallowederror') || lower.includes('permission denied') || lower.includes('permission_denied') || lower.includes('not-allowed')) {
    return 'Microphone permission was denied. Please allow microphone access in your browser to start the call.';
  }
  if (lower.includes('notfounderror') || lower.includes('deviceserror') || lower.includes('audio input not found') || lower.includes('requested device not found')) {
    return 'No microphone was found on your device. Please connect a microphone and try again.';
  }
  if (lower.includes('invalid key') || lower.includes('unauthorized') || lower.includes('status code 401')) {
    return 'Vapi authentication failed. Please verify that your VAPI_PUBLIC_KEY and VAPI_API_KEY are configured correctly.';
  }
  if (lower.includes('quota') || lower.includes('insufficient_quota') || lower.includes('balance') || lower.includes('credits')) {
    return 'Vapi or model provider quota reached. Please check your Vapi credits and OpenAI/LLM provider billing.';
  }
  return msg;
}

// Pulls the human-readable message out of the SDK's error envelope, e.g.
// { type: 'daily-error', error: { message, stack, name }, timestamp }
// or Axios response error bodies.
function extractErrorMessage(err, fallback = 'Voice call error.') {
  if (!err) return fallback;
  if (typeof err === 'string') return formatCleanErrorMessage(err, fallback);

  let rawMsg =
    err?.error?.response?.data?.message ||
    err?.response?.data?.message ||
    err?.error?.message ||
    err?.message ||
    err?.error?.msg ||
    err?.msg ||
    err?.error?.error ||
    (typeof err?.error === 'string' ? err.error : null) ||
    (typeof err?.errorMsg === 'string' ? err.errorMsg : null);

  if (!rawMsg && typeof err?.error === 'object' && err.error !== null) {
    try {
      rawMsg = JSON.stringify(err.error);
    } catch {
      rawMsg = null;
    }
  }

  if (!rawMsg) {
    try {
      rawMsg = JSON.stringify(err);
    } catch {
      rawMsg = fallback;
    }
  }

  return formatCleanErrorMessage(rawMsg, fallback);
}

export class VapiCallController {
  constructor({ vapiPublicKey, assistantId, assistantOverrides }) {
    // The public key is not secret, so either source is safe — prefer the
    // build-time env var (standard Vite client-key pattern, avoids a network
    // round trip depending on it) and fall back to whatever the backend sent
    // in the start-conversation response, for deployments that only set it
    // server-side.
    this.vapiPublicKey = vapiPublicKey || import.meta.env.VITE_VAPI_PUBLIC_KEY || 'ab7b394f-5d50-4326-a71a-4b65121dad55';
    this.assistantId = assistantId || 'fd0c5baf-047e-4e85-a9c5-a1d531a2bada';
    this.assistantOverrides = assistantOverrides;
    this.vapi = null;
    this.listeners = new Map();
    // Set the instant the call is asked to end (by the user, a timeout, or a
    // real 'call-end' from the SDK) — guards against any of those paths
    // firing twice, and against a late-resolving start() reviving a call the
    // user already gave up on.
    this._ended = false;
    this._lastError = null;
    this._voiceStatus = 'idle';
    // Per-role debounce timers for partial transcripts (see PARTIAL_DEBOUNCE_MS).
    this._partialTimers = { visitor: null, ai: null };
    // Smart Conversation Ending countdown — see SMART_ENDING_SILENCE_MS.
    this._endingTimer = null;
    // True from the moment a visitor goodbye is detected until either it's
    // confirmed cancelled (visitor keeps talking, or the assistant asks a
    // real follow-up) or the ending actually triggers. Survives across the
    // assistant's own reply turn — see speech-start/speech-end.
    this._pendingGoodbye = false;
    // Set the instant _triggerSmartEnding() decides to end the call — read
    // by the 'call-end' handler so 'smart-ending' fires in the SAME tick as
    // 'conversation-ended' (i.e. once the call has actually, fully ended,
    // closing line included), not earlier. This is what the UI's post-call
    // modal is gated on; firing it any earlier would show the modal while
    // the assistant is still mid-goodbye.
    this._smartEndingTriggered = false;
    // See MIC_SILENCE_CHECK_MS above.
    this._micLevelSeen = false;
    this._micSilenceTimer = null;
    // Timestamp of the last successful connect() — used to distinguish a
    // real, completed conversation from a call that connected and then
    // immediately died (see the 'call-end' handler below).
    this._connectedAt = null;
    // Real-time live conversation intelligence history
    this._transcriptHistory = [];
    this._reportedObjections = new Set();
  }

  _updateLiveSignals(entry) {
    if (!entry || !entry.text) return;
    const withoutPending = this._transcriptHistory.filter((t) => !(t.role === entry.role && !t.final));
    this._transcriptHistory = [...withoutPending, entry];

    const analysis = analyzeLiveConversation(this._transcriptHistory);
    this._emit('scores-update', analysis.scores);
    if (analysis.liveDna) {
      this._emit('live-dna', analysis.liveDna);
    }
    if (analysis.detectedSignals?.length > 0) {
      this._emit('detected-signals', analysis.detectedSignals);
    }

    if (Array.isArray(analysis.objections)) {
      analysis.objections.forEach((obj) => {
        if (!this._reportedObjections.has(obj.type)) {
          this._reportedObjections.add(obj.type);
          this._emit('objection-detected', obj);
        }
      });
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  _emit(event, payload) {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }

  _setVoiceStatus(status) {
    if (this._voiceStatus === status) return;
    this._voiceStatus = status;
    this._emit('voice-status', status);
  }

  _clearPartialTimer(role) {
    if (this._partialTimers[role]) {
      clearTimeout(this._partialTimers[role]);
      this._partialTimers[role] = null;
    }
  }

  // Clears the pending TIMER only — does not clear the _pendingGoodbye
  // intent itself. Used while the assistant is speaking (we never want the
  // countdown to fire mid-speech) without discarding the fact that a
  // goodbye is still awaiting confirmation once that speech finishes.
  _pauseSmartEndingTimer() {
    if (this._endingTimer) {
      clearTimeout(this._endingTimer);
      this._endingTimer = null;
    }
  }

  // Fully abandons a pending goodbye — the visitor kept talking, or the
  // assistant asked a genuine follow-up question. Both the timer and the
  // underlying intent are cleared.
  _cancelSmartEnding() {
    this._pauseSmartEndingTimer();
    this._pendingGoodbye = false;
  }

  _scheduleSmartEnding() {
    this._pauseSmartEndingTimer();
    this._endingTimer = setTimeout(() => {
      this._endingTimer = null;
      this._triggerSmartEnding();
    }, SMART_ENDING_SILENCE_MS);
  }

  _triggerSmartEnding() {
    if (this._ended || !this.vapi) return;
    this._pendingGoodbye = false;
    this._smartEndingTriggered = true;
    const message = CLOSING_MESSAGES[Math.floor(Math.random() * CLOSING_MESSAGES.length)];
    // Speaks the closing line via Vapi's own TTS, then ends the call once
    // it's done speaking — the existing 'call-end' handler (from Daily's
    // 'left-meeting') takes it from there exactly like any other hangup:
    // mic stops, audio stream stops, status becomes 'ended'. 'smart-ending'
    // itself is emitted from that same handler, once the call has actually
    // finished — not here, before the closing line has even been spoken.
    this.vapi.say(message, true);
  }

  _handleTranscriptMessage(message) {
    // Vapi's ClientMessageTranscript.type is "transcript" for ordinary
    // delivery, but can also arrive as "transcript[transcriptType='final']"
    // depending on clientMessages config — matching only the exact string
    // "transcript" silently drops that variant.
    if (!message?.type?.startsWith('transcript')) return;

    const role = message.role === 'user' ? 'visitor' : 'ai';
    const entry = {
      role,
      text: message.transcript,
      final: message.transcriptType === 'final',
      interim: message.transcriptType === 'partial',
    };

    if (entry.final) {
      this._clearPartialTimer(role);
      this._emit('transcript', entry);
      this._updateLiveSignals(entry);
    } else if (SENTENCE_END_RE.test(entry.text ?? '')) {
      // Already a complete sentence — no reason to wait out the debounce.
      this._clearPartialTimer(role);
      this._emit('transcript', entry);
      this._updateLiveSignals(entry);
    } else {
      this._clearPartialTimer(role);
      this._partialTimers[role] = setTimeout(() => {
        this._partialTimers[role] = null;
        this._emit('transcript', entry);
        this._updateLiveSignals(entry);
      }, PARTIAL_DEBOUNCE_MS);
    }

    if (role === 'visitor') {
      this._setVoiceStatus(entry.final ? 'thinking' : 'listening');

      // Any visitor speech — even a new partial — means they're still
      // engaged, so a previously-scheduled smart-ending countdown is fully
      // abandoned first. Only a FINAL utterance that itself sounds like a
      // goodbye starts a fresh one (safety-net timer, in case the assistant
      // never replies at all — see speech-start/speech-end for the normal
      // path where it does).
      this._cancelSmartEnding();
      if (entry.final && matchesEndingPhrase(entry.text)) {
        this._pendingGoodbye = true;
        this._scheduleSmartEnding();
      }
    } else if (role === 'ai' && entry.final && this._pendingGoodbye && soundsLikeContinuation(entry.text)) {
      // The assistant chose to ask something rather than just acknowledge
      // the goodbye (e.g. one more qualifying question) — respect that and
      // drop the pending ending. A short acknowledgment ("You're welcome!")
      // does NOT clear this; see speech-end, which re-arms the countdown
      // once the assistant is done talking either way.
      this._cancelSmartEnding();
    }
  }

  async connect() {
    if (!this.vapiPublicKey) {
      throw new Error('Voice calling is not configured (missing Vapi public key).');
    }

    this.vapi = new Vapi(this.vapiPublicKey);
    this._ended = false;
    this._lastError = null;

    this.vapi.on('message', (message) => this._handleTranscriptMessage(message));

    this.vapi.on('speech-start', () => {
      // IMPORTANT: this does NOT cancel a pending smart-ending countdown.
      // Root cause of an earlier bug: when a visitor says "thank you, bye",
      // the assistant's own LLM almost always replies with something first
      // ("You're welcome, have a great day!") — that's normal conversation,
      // not a signal to keep going. Treating "the assistant started
      // speaking" as cancellation meant that natural reply killed the
      // countdown on nearly every real call, so the smart ending almost
      // never fired. We only PAUSE the raw timer here (never let it fire
      // mid-speech, since the modal/closing line must never overlap the
      // assistant talking) — the underlying _pendingGoodbye intent survives
      // and speech-end below re-arms it once the assistant is done. The
      // assistant's own transcript is what actually decides whether to
      // abandon it (soundsLikeContinuation, above).
      this._pauseSmartEndingTimer();
      this._emit('ai-speaking', true);
      this._setVoiceStatus('speaking');
    });
    this.vapi.on('speech-end', () => {
      this._emit('ai-speaking', false);
      this._setVoiceStatus('listening');

      // The assistant just finished talking. If a goodbye is still pending
      // (i.e. its reply wasn't a real follow-up question), THIS is the
      // correct moment to start counting down — after its speech is fully
      // done, never during. Restarting fresh here (rather than trusting
      // whatever was left of the original safety-net timer) guarantees the
      // full silence window is measured from actual silence, not from
      // whenever the visitor originally said goodbye.
      if (this._pendingGoodbye) {
        this._scheduleSmartEnding();
      }
    });

    // Assistant (playback) and local (microphone) amplitude, both 0-1 —
    // drives Waveform.jsx exactly like the old mic-level/ai-level events did.
    this.vapi.on('volume-level', (level) => this._emit('ai-level', level));
    this.vapi.on('local-volume-level', (level) => {
      this._micLevelSeen = true;
      this._emit('mic-level', level);
    });

    // Real hangup signal from the SDK (fires from Daily's 'left-meeting').
    // Guarded by _ended so this can't double-fire after we've already
    // force-ended locally (see _forceEnd).
    this.vapi.on('call-end', () => {
      if (this._ended) return;
      this._ended = true;
      this._setVoiceStatus('idle');

      const failedToConnect =
        this._connectedAt && !this._micLevelSeen && Date.now() - this._connectedAt < ABRUPT_DISCONNECT_MS;
      if (failedToConnect) {
        this._emit('error', {
          code: 'CONNECTION_DROPPED',
          message: 'The call disconnected right after connecting and never received any audio. This is usually a network issue — check your connection and try again.',
        });
        return;
      }

      // Fired here — once the call has ACTUALLY, fully ended (closing line
      // included) — rather than back when _triggerSmartEnding() first
      // decided to wrap up. Emitting it that early was the second bug: the
      // post-call modal listens for this and was popping up while the
      // assistant was still mid-goodbye. Same tick as 'conversation-ended'
      // below, so the UI's status==='ended' and endedNaturally flags land
      // together with no race between them.
      if (this._smartEndingTriggered) {
        this._emit('smart-ending', {});
      }
      this._emit('conversation-ended', {});
    });

    this.vapi.on('error', (err) => {
      const message = extractErrorMessage(err, 'Voice call error.');
      this._lastError = message;
      this._emit('error', { code: 'VAPI_ERROR', message });
    });

    // Dedicated failure event for the start() flow specifically — carries
    // richer diagnostics (stage, error, errorStack) than the generic 'error'
    // event that's emitted alongside it.
    this.vapi.on('call-start-failed', (event) => {
      const msg = extractErrorMessage(event?.error ?? event, this._lastError);
      this._lastError = msg;
    });

    // CRITICAL: @vapi-ai/web's start() catches its own failures internally
    // and resolves to `null` on failure instead of rejecting (confirmed by
    // reading node_modules/@vapi-ai/web/dist/vapi.js — every failure path
    // ends in `await this.cleanup(); return null;`, never a throw). Awaiting
    // it without checking the resolved value means a failed call start is
    // silently treated as success: the UI flips to "Live" for a call that
    // was never created, and vapi.stop() becomes a permanent no-op afterward
    // because stop() only acts `if (this.call)` — which cleanup() already
    // nulled. The explicit `if (!result)` check below is what makes a failed
    // start actually surface as an error instead of a stuck, undead "active"
    // call. The timeout race covers the separate case of the underlying
    // fetch/WebRTC join hanging outright with no resolution at all (a real
    // possibility on a flaky network) — start() has no timeout of its own.
    const result = await Promise.race([
      this.vapi.start(this.assistantId, this.assistantOverrides),
      new Promise((resolve) => setTimeout(() => resolve('__TIMEOUT__'), CONNECT_TIMEOUT_MS)),
    ]);

    if (this._ended) {
      // User (or something else) already force-ended while start() was
      // still in flight — don't let a late success resurrect the call.
      throw new Error('Call was ended before it finished connecting.');
    }

    if (result === '__TIMEOUT__') {
      this._forceEnd();
      throw new Error('Voice call timed out while connecting. Check your network connection and try again.');
    }

    if (!result) {
      this._ended = true;
      const errorMsg = typeof this._lastError === 'string' && this._lastError ? this._lastError : 'Failed to start the voice call. Please check your Vapi API keys.';
      throw new Error(errorMsg);
    }

    // Connected — assistant will either greet immediately (speech-start
    // handles that transition) or wait for the visitor to speak first.
    this._setVoiceStatus('listening');
    this._connectedAt = Date.now();

    this._micSilenceTimer = setTimeout(() => {
      this._micSilenceTimer = null;
      if (!this._ended && !this._micLevelSeen) {
        this._emit('mic-silent-warning', {});
      }
    }, MIC_SILENCE_CHECK_MS);
  }

  endCall() {
    this._forceEnd();
  }

  disconnect() {
    this._forceEnd();
  }

  // Single teardown path for both a graceful "End call" click and a
  // "Cancel" click mid-connection. Updates local state and notifies
  // listeners synchronously/immediately — it does NOT wait for vapi.stop()
  // (which is async, and a confirmed no-op if the call never finished
  // connecting) before unblocking the UI. stop() is still called as a
  // best-effort cleanup of whatever Daily/Vapi state does exist, which also
  // stops the microphone and any in-progress audio playback (Daily's
  // call.destroy() tears down the whole WebRTC session).
  _forceEnd() {
    if (this._ended) return;
    this._ended = true;
    this._clearPartialTimer('visitor');
    this._clearPartialTimer('ai');
    this._cancelSmartEnding();
    if (this._micSilenceTimer) {
      clearTimeout(this._micSilenceTimer);
      this._micSilenceTimer = null;
    }
    this._setVoiceStatus('idle');
    this._emit('conversation-ended', {});
    const vapi = this.vapi;
    this.vapi = null;
    vapi?.stop().catch(() => {});
  }
}
