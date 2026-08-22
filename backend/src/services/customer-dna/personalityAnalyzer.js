import { RESEARCHER_MIN_SESSIONS, STUDENT_MAX_INTEREST_SCORE, EXPLORER_MAX_SESSIONS, TECHNICAL_KEYWORDS, BUSINESS_KEYWORDS } from './scoringConfig.js';

function countKeywordMatches(visitorMessages, keywords) {
  const lowerContent = visitorMessages.map((m) => m.content.toLowerCase());
  return keywords.reduce((count, keyword) => count + lowerContent.filter((c) => c.includes(keyword)).length, 0);
}

/**
 * Classifies the visitor into one of the seven Customer DNA personality
 * types. Evaluated as an ordered rule cascade — most specific/reliable
 * signal first — rather than a weighted score, because these categories are
 * meant to be individually explainable ("why did we call them a Technical
 * Buyer?") to a sales rep reading the profile, which a blended score isn't.
 */
export function analyzePersonality({ lead, behavior, intent, company, messages }) {
  const visitorMessages = messages.filter((m) => m.role === 'VISITOR');
  const technicalSignals = countKeywordMatches(visitorMessages, TECHNICAL_KEYWORDS);
  const businessSignals = countKeywordMatches(visitorMessages, BUSINESS_KEYWORDS);

  // 1. An explicitly stated decision-making role is the strongest, most
  // direct signal available — always wins when present.
  if (lead?.decisionMaker === true) {
    return 'DECISION_MAKER';
  }

  // 2. Enterprise-scale company or budget outranks the finer-grained buyer
  // types below — the sales motion for this segment differs regardless of
  // whether they lean technical or business-focused.
  if (company.companySize === 'ENTERPRISE' || company.budgetLevel === 'ENTERPRISE') {
    return 'ENTERPRISE_BUYER';
  }

  // 3. Technical vs. business evaluator, by which vocabulary dominates.
  if (technicalSignals > 0 && technicalSignals >= businessSignals) {
    return 'TECHNICAL_BUYER';
  }
  if (businessSignals > 0 && businessSignals > technicalSignals) {
    return 'BUSINESS_BUYER';
  }

  // 4. No conversation yet (or no signal from it) — fall back to behavior
  // patterns. Repeated visits without converting to a call reads as active
  // research; a single low-intent session reads as casual exploration; very
  // low engagement with no business context at all reads as a non-buyer
  // (student/tire-kicker) rather than a stalled genuine prospect.
  if (behavior.sessionCount >= RESEARCHER_MIN_SESSIONS && intent.messageCount === 0) {
    return 'RESEARCHER';
  }
  if (behavior.engagementScore <= STUDENT_MAX_INTEREST_SCORE && intent.messageCount === 0) {
    return 'STUDENT';
  }
  if (behavior.sessionCount <= EXPLORER_MAX_SESSIONS) {
    return 'EXPLORER';
  }

  return 'RESEARCHER';
}
