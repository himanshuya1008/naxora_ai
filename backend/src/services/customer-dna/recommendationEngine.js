import { RECOMMENDATION_THRESHOLDS } from './scoringConfig.js';

// Priority order for picking a single nextBestAction out of the full
// recommendations set — highest-commitment, most decisive actions first,
// FOLLOW_UP_CALL last as the safety-net default when nothing stronger applies.
const NEXT_BEST_ACTION_PRIORITY = ['SCHEDULE_MEETING', 'ENTERPRISE_PLAN', 'DEMO', 'FREE_TRIAL', 'PRICING', 'CASE_STUDY', 'FOLLOW_UP_CALL'];

/**
 * Rule-based mapping from the customer's scored DNA state to a set of
 * concrete sales actions. Every rule is independently explainable — this is
 * a recommendation engine for what to DO next, distinct from
 * recommendationService.js's service-catalog matching (which recommends
 * WHICH product/service, not which sales motion).
 */
export function recommendActions({ scores, personality, company, intent, behavior }) {
  const recommendations = new Set();

  const isEnterprise = company.companySize === 'ENTERPRISE' || company.budgetLevel === 'ENTERPRISE' || personality === 'ENTERPRISE_BUYER';

  if (isEnterprise && scores.buyingProbability >= RECOMMENDATION_THRESHOLDS.scheduleMeetingBuyingProbability) {
    recommendations.add('SCHEDULE_MEETING');
    recommendations.add('ENTERPRISE_PLAN');
  }

  if (scores.buyingProbability >= RECOMMENDATION_THRESHOLDS.demoBuyingProbability) {
    recommendations.add('DEMO');
  } else if (scores.buyingProbability >= RECOMMENDATION_THRESHOLDS.freeTrialBuyingProbability) {
    recommendations.add('FREE_TRIAL');
  }

  // A price objection is the single clearest trigger for a pricing
  // conversation — more direct than inferring it from the score alone.
  if (intent.objections.includes('PRICE') || intent.budgetMentioned) {
    recommendations.add('PRICING');
  }

  // Still actively researching (repeat visits, no conversation yet, or a
  // Researcher/Explorer read) benefits more from social proof than a hard
  // pitch — case studies build the confidence a live demo can't yet earn.
  if (personality === 'RESEARCHER' || personality === 'EXPLORER' || (behavior.isReturnVisitor && intent.messageCount === 0)) {
    recommendations.add('CASE_STUDY');
  }

  // Low-probability leads still worth a human touch, and the universal
  // fallback when no stronger signal fired above.
  if (scores.buyingProbability < RECOMMENDATION_THRESHOLDS.followUpCallBuyingProbability || recommendations.size === 0) {
    recommendations.add('FOLLOW_UP_CALL');
  }

  const nextBestAction = NEXT_BEST_ACTION_PRIORITY.find((action) => recommendations.has(action)) ?? 'FOLLOW_UP_CALL';

  return { recommendations: [...recommendations], nextBestAction };
}
