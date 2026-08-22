// Silence check-ins are deliberately NOT routed through the LLM: it's an
// idle/interrupt event with no new content to reason about, the spec gives
// exact expected wording, and a canned rotation guarantees the AI never says
// something off-script during dead air while adding zero latency/cost.
const SILENCE_PHRASES = [
  "Take your time. Is there anything specific you'd like me to explain?",
  "No rush at all — happy to go deeper on anything that's on your mind.",
  "I'm here whenever you're ready. Anything I can clarify?",
];

// Picks a phrase different from the AI's last message where possible. Derived
// from DB state (not in-memory rotation) so it's correct across multiple
// horizontally-scaled server instances, not just a single process.
export function pickSilencePhrase(lastAiMessageContent) {
  const candidates = SILENCE_PHRASES.filter((phrase) => phrase !== lastAiMessageContent);
  const pool = candidates.length > 0 ? candidates : SILENCE_PHRASES;
  return pool[Math.floor(Math.random() * pool.length)];
}
