import { COMMUNICATION_STYLE_THRESHOLDS } from './scoringConfig.js';
import { average, containsDevanagari } from './utils.js';

function countWords(text) {
  return (text ?? '').trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Places the visitor on the same DISC-style communication axis used
 * elsewhere in this codebase (ai/conversationBrain) — independently derived
 * here from message form (question density, message length) rather than
 * LLM judgment, since this module doesn't make its own LLM calls.
 */
function classifyCommunicationStyle(visitorMessages, questionsAsked) {
  if (visitorMessages.length === 0) return 'ANALYTICAL'; // neutral default when there's no signal yet

  const avgWordCount = average(visitorMessages.map((m) => countWords(m.content)));
  const questionDensity = questionsAsked / visitorMessages.length;

  if (questionDensity >= COMMUNICATION_STYLE_THRESHOLDS.highQuestionDensity) return 'ANALYTICAL';
  if (avgWordCount <= COMMUNICATION_STYLE_THRESHOLDS.shortMessageWordCount) return 'DRIVER';
  if (avgWordCount >= COMMUNICATION_STYLE_THRESHOLDS.longMessageWordCount) return 'EXPRESSIVE';
  return 'AMIABLE';
}

// Devanagari-script share of the transcript is a direct, reliable signal for
// Hindi vs. English — no dependency on the call's selected language (this
// module stays independent of the voice pipeline's own state).
const HINDI_SHARE_THRESHOLD = 0.3;

function detectPreferredLanguage(visitorMessages) {
  if (visitorMessages.length === 0) return 'en';
  const hindiMessageCount = visitorMessages.filter((m) => containsDevanagari(m.content)).length;
  return hindiMessageCount / visitorMessages.length >= HINDI_SHARE_THRESHOLD ? 'hi' : 'en';
}

/**
 * Pure function: transcript in, communication style + preferred language out.
 */
export function analyzeCommunication({ messages, questionsAsked }) {
  const visitorMessages = messages.filter((m) => m.role === 'VISITOR');

  return {
    communicationStyle: classifyCommunicationStyle(visitorMessages, questionsAsked),
    preferredLanguage: detectPreferredLanguage(visitorMessages),
  };
}
