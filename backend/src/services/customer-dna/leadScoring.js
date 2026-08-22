import {
  BUYING_PROBABILITY_WEIGHTS,
  LEAD_GRADE_THRESHOLDS,
  INTENT_LEVEL_THRESHOLDS,
  CONFIDENCE_WEIGHTS,
  CONFIDENCE_BEHAVIOR_EVENTS_FULL_CREDIT,
  CONFIDENCE_SESSIONS_FULL_CREDIT,
  CONFIDENCE_MESSAGES_FULL_CREDIT,
  CONFIDENCE_LEAD_FIELDS_TOTAL,
} from './scoringConfig.js';
import { clamp, roundTo } from './utils.js';

// Website engagement (attention) is the base; conversation-level buying
// signals (questions, explicit intent phrases, a volunteered budget) add on
// top, since a visitor who asks pointed questions and mentions budget is
// showing more genuine interest than clicks alone capture.
function computeInterestScore({ engagementScore, questionsAsked, explicitBuyingSignals, budgetMentioned }) {
  const score = engagementScore + Math.min(questionsAsked * 2, 15) + Math.min(explicitBuyingSignals.length * 8, 20) + (budgetMentioned ? 10 : 0);
  return Math.round(clamp(score, 0, 100));
}

// Prefers the voice pipeline's own live, per-turn LLM-judged trust score
// when one exists for this conversation (ai/conversationBrain already
// tracks this turn-by-turn during the call — the single best available
// signal) blended with our own cross-session read so a customer with a
// history of prior positive interactions isn't scored from this call alone.
// Falls back to a sentiment/objection-derived baseline when no live score
// exists yet (e.g. a profile built from website behavior before any call).
function computeTrustScore({ sentiment, objectionsCount, latestScoreSnapshot }) {
  const sentimentAdjustment = sentiment * 30; // -1..1 -> -30..+30
  const objectionPenalty = Math.min(objectionsCount * 8, 30);
  const baseline = clamp(50 + sentimentAdjustment - objectionPenalty, 0, 100);

  if (!latestScoreSnapshot) return Math.round(baseline);

  const blended = baseline * 0.4 + latestScoreSnapshot.trustScore * 0.6;
  return Math.round(clamp(blended, 0, 100));
}

function computeBuyingProbability({ interestScore, engagementScore, trustScore, latestScoreSnapshot }) {
  const ownEstimate =
    interestScore * BUYING_PROBABILITY_WEIGHTS.interestScore +
    engagementScore * BUYING_PROBABILITY_WEIGHTS.engagementScore +
    trustScore * BUYING_PROBABILITY_WEIGHTS.trustScore;

  if (!latestScoreSnapshot) return Math.round(clamp(ownEstimate, 0, 100));

  // Blended rather than simply copied: this module's estimate already
  // reflects cross-session behavior the live per-call score can't see, but
  // the live score reflects real-time conversational judgment this module
  // doesn't otherwise have — neither alone is the full picture.
  const blended = ownEstimate * 0.6 + latestScoreSnapshot.buyingProbability * 0.4;
  return Math.round(clamp(blended, 0, 100));
}

function resolveByThreshold(value, thresholds, key) {
  const match = thresholds.find((t) => value >= t.min);
  return match ? match[key] : thresholds[thresholds.length - 1][key];
}

function computeConfidence({ eventCount, sessionCount, messageCount, leadFieldsCaptured }) {
  const behaviorCredit = clamp(eventCount / CONFIDENCE_BEHAVIOR_EVENTS_FULL_CREDIT, 0, 1) * CONFIDENCE_WEIGHTS.behaviorEvents;
  const sessionCredit = clamp(sessionCount / CONFIDENCE_SESSIONS_FULL_CREDIT, 0, 1) * CONFIDENCE_WEIGHTS.sessions;
  const messageCredit = clamp(messageCount / CONFIDENCE_MESSAGES_FULL_CREDIT, 0, 1) * CONFIDENCE_WEIGHTS.messages;
  const leadFieldsCredit = clamp(leadFieldsCaptured / CONFIDENCE_LEAD_FIELDS_TOTAL, 0, 1) * CONFIDENCE_WEIGHTS.leadFieldsCaptured;

  return roundTo(clamp(behaviorCredit + sessionCredit + messageCredit + leadFieldsCredit, 0, 1), 2);
}

function countCapturedLeadFields(lead) {
  if (!lead) return 0;
  const fields = [lead.name, lead.email, lead.company, lead.industry, lead.companySize, lead.budget, lead.timeline, lead.teamSize];
  return fields.filter((f) => f != null && f !== '').length;
}

/**
 * Computes the four headline Customer DNA scores, the derived lead grade and
 * intent level, and the profile's overall confidence. Pure function — every
 * input is data already gathered by profileBuilder.js.
 */
export function computeLeadScore({ behavior, intent, lead, latestScoreSnapshot, events, sessions, messages }) {
  const engagementScore = behavior.engagementScore;
  const interestScore = computeInterestScore({
    engagementScore,
    questionsAsked: intent.questionsAsked,
    explicitBuyingSignals: intent.explicitBuyingSignals,
    budgetMentioned: intent.budgetMentioned,
  });
  const trustScore = computeTrustScore({ sentiment: intent.sentiment, objectionsCount: intent.objections.length, latestScoreSnapshot });
  const buyingProbability = computeBuyingProbability({ interestScore, engagementScore, trustScore, latestScoreSnapshot });

  const leadGrade = resolveByThreshold(buyingProbability, LEAD_GRADE_THRESHOLDS, 'grade');
  const intentLevel = resolveByThreshold(interestScore, INTENT_LEVEL_THRESHOLDS, 'level');

  const confidence = computeConfidence({
    eventCount: events.length,
    sessionCount: sessions.length,
    messageCount: messages.length,
    leadFieldsCaptured: countCapturedLeadFields(lead),
  });

  return { interestScore, trustScore, engagementScore, buyingProbability, leadGrade, intentLevel, confidence };
}
