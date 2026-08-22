import { analyzeBehavior } from './behaviorAnalyzer.js';
import { analyzeConversation } from './intentAnalyzer.js';
import { analyzeCompany } from './companyAnalyzer.js';
import { analyzeCommunication } from './communicationAnalyzer.js';
import { analyzePersonality } from './personalityAnalyzer.js';
import { computeLeadScore } from './leadScoring.js';
import { recommendActions } from './recommendationEngine.js';
import { uniqueInOrder } from './utils.js';

const PERSONALITY_LABELS = {
  DECISION_MAKER: 'a decision maker',
  TECHNICAL_BUYER: 'a technical evaluator',
  BUSINESS_BUYER: 'a business-outcome-focused buyer',
  RESEARCHER: 'actively researching across multiple visits',
  EXPLORER: 'in an early, exploratory stage',
  STUDENT: 'browsing with low buying signal so far',
  ENTERPRISE_BUYER: 'an enterprise-scale buyer',
};

const GRADE_LABELS = { A_PLUS: 'A+', A: 'A', B_PLUS: 'B+', B: 'B', C: 'C', D: 'D' };

// Deterministic, template-based summary rather than an LLM call — this
// module makes no LLM calls of its own by design (see module README in
// index.js): reportGenerator.js already produces an LLM-authored narrative
// summary for the post-call sales report, and duplicating that here would
// both be redundant and compete for the same rate-limited model quota this
// project already runs on a free tier. Every clause below is a direct,
// traceable readout of a computed field, not a guess.
function buildConversationSummary({ scores, personality, company, intent, behavior, carryForward }) {
  const parts = [];

  parts.push(`Grade ${GRADE_LABELS[scores.leadGrade]} lead, ${PERSONALITY_LABELS[personality]}.`);

  if (company.company || company.industry) {
    parts.push(`${company.company ?? 'Company'}${company.industry ? ` (${company.industry})` : ''}${company.companySize ? `, ${company.companySize.toLowerCase().replace('_', ' ')} size` : ''}.`);
  }

  if (intent.messageCount > 0) {
    parts.push(`Asked ${intent.questionsAsked} question(s) across the conversation.`);
  } else if (behavior.sessionCount > 0) {
    parts.push(`${behavior.sessionCount} website session(s), no conversation yet.`);
  }

  const painPoints = uniqueInOrder([...carryForward.painPoints, ...intent.painPoints]);
  if (painPoints.length > 0) {
    parts.push(`Pain points: ${painPoints.slice(0, 3).join('; ')}.`);
  }

  const objections = uniqueInOrder([...carryForward.objections, ...intent.objections]);
  if (objections.length > 0) {
    parts.push(`Objections raised: ${objections.join(', ')}.`);
  }

  if (intent.budgetMentioned) {
    parts.push(company.budgetAmountUsd ? `Budget indicated around $${Math.round(company.budgetAmountUsd).toLocaleString()}.` : 'Budget was discussed but no specific figure given.');
  }

  return parts.join(' ');
}

/**
 * The composition root of the Customer DNA engine: calls every analyzer
 * with the raw data profileBuilder.js is given, then assembles the final
 * profile matching the module's public output contract. No direct database
 * access — all I/O is the caller's (customerDNAService.js) responsibility.
 * Async only because analyzeConversation makes an LLM call for pain-point/
 * objection extraction; every other analyzer here remains a pure, sync,
 * independently unit-testable function.
 */
export async function buildProfile({ sessionId, customerId, events, sessions, messages, objectionLogs, lead, visitor, latestScoreSnapshot, carryForward }) {
  const behavior = analyzeBehavior({ events, sessions });
  const intent = await analyzeConversation({ messages, objectionLogs });
  const company = analyzeCompany({ lead, visitor, conversationSignals: intent });
  const communication = analyzeCommunication({ messages, questionsAsked: intent.questionsAsked });
  const personality = analyzePersonality({ lead, behavior, intent, company, messages });
  const scores = computeLeadScore({ behavior, intent, lead, latestScoreSnapshot, events, sessions, messages });
  const { recommendations, nextBestAction } = recommendActions({ scores, personality, company, intent, behavior });

  const painPoints = uniqueInOrder([...carryForward.painPoints, ...intent.painPoints]).slice(0, 15);
  const objections = uniqueInOrder([...carryForward.objections, ...intent.objections]);
  const productsInterested = uniqueInOrder([lead?.interestedService, ...behavior.productsInterested].filter(Boolean));

  const conversationSummary = buildConversationSummary({ scores, personality, company, intent, behavior, carryForward });

  return {
    sessionId,
    customerId,

    interestScore: scores.interestScore,
    trustScore: scores.trustScore,
    engagementScore: scores.engagementScore,
    buyingProbability: scores.buyingProbability,

    leadGrade: scores.leadGrade,
    intentLevel: scores.intentLevel,

    personality,
    communicationStyle: communication.communicationStyle,
    preferredLanguage: communication.preferredLanguage,

    budgetLevel: company.budgetLevel,
    companySize: company.companySize,
    industry: company.industry,

    painPoints,
    productsInterested,
    objections,
    recommendations,
    nextBestAction,

    conversationSummary,
    confidence: scores.confidence,
  };
}
