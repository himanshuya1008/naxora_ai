/**
 * Single source of truth for every threshold, weight, and keyword list used
 * across the Customer DNA module. No analyzer file should ever have a bare
 * magic number in it — if a value drives a decision, it lives here, named,
 * so tuning the engine never means hunting through analyzer logic.
 */

// ---------------------------------------------------------------------------
// Behavior analysis (behaviorAnalyzer.js)
// ---------------------------------------------------------------------------

// Which raw BehaviorEventType values count as a "CTA click" for engagement
// purposes — a deliberate product decision, not an accident of the schema.
export const CTA_EVENT_TYPES = ['CLICK', 'DEMO_REQUEST', 'FORM_SUBMIT', 'VIDEO_PLAY'];
export const PRICING_EVENT_TYPES = ['PRICING_VIEW', 'ENTERPRISE_VIEW'];

// Engagement score (0-100) is a weighted blend of these components.
export const ENGAGEMENT_WEIGHTS = {
  pageViews: 20, // capped contribution from total page views
  ctaClicks: 25, // capped contribution from CTA-type interactions
  pricingVisits: 20, // capped contribution from pricing/enterprise page visits
  scrollDepth: 15, // scaled directly from average scroll percentage
  sessionDuration: 10, // capped contribution from time spent
  returnVisitor: 10, // flat bonus for a second-or-later session
};

export const ENGAGEMENT_PAGE_VIEWS_FULL_CREDIT = 15; // page views at/above this = full pageViews credit
export const ENGAGEMENT_CTA_CLICKS_FULL_CREDIT = 5; // CTA clicks at/above this = full ctaClicks credit
export const ENGAGEMENT_PRICING_VISITS_FULL_CREDIT = 3; // pricing/enterprise visits at/above this = full credit
export const ENGAGEMENT_SESSION_DURATION_FULL_CREDIT_SECONDS = 600; // 10 minutes = full sessionDuration credit

// ---------------------------------------------------------------------------
// Conversation analysis (intentAnalyzer.js)
// ---------------------------------------------------------------------------

export const PAIN_POINT_KEYWORDS = [
  'problem',
  'issue',
  'struggl',
  'challeng',
  'difficult',
  'frustrat',
  'pain',
  'bottleneck',
  'inefficient',
  'manual',
  'slow',
  'expensive',
  'waste',
  'error',
  'broken',
];

export const BUDGET_KEYWORDS = ['budget', 'price', 'pricing', 'cost', 'afford', 'spend', 'investment', 'quote'];

// Fallback keyword→ObjectionType map, used only when a conversation has no
// structured ObjectionLog rows yet (e.g. very short/new conversations) —
// the voice pipeline's own typed objection detection (ai/conversationBrain)
// is always preferred when it's available; see intentAnalyzer.js.
export const OBJECTION_KEYWORD_MAP = {
  PRICE: ['expensive', 'costly', 'too much', 'cheaper', "can't afford", 'budget is tight'],
  TRUST: ['not sure', 'skeptical', 'prove it', 'guarantee', 'trust'],
  TIMING: ['not now', 'later', 'next quarter', 'too soon', 'busy right now'],
  COMPETITOR: ['already using', 'competitor', 'currently use', 'switching from'],
  FEATURE_GAP: ["doesn't have", 'missing', 'lacks', 'need it to also'],
  AUTHORITY: ['not my decision', 'need approval', 'ask my', 'not the decision maker'],
};

// ---------------------------------------------------------------------------
// Communication style (communicationAnalyzer.js)
// ---------------------------------------------------------------------------

// Average words-per-message and question-density thresholds used to place a
// visitor on the DISC-style axis already used elsewhere in this codebase
// (ai/conversationBrain) — same four labels, independently classified here
// from conversational form rather than LLM judgment.
export const COMMUNICATION_STYLE_THRESHOLDS = {
  highQuestionDensity: 0.4, // share of messages that are questions
  longMessageWordCount: 25, // messages averaging above this = expressive/detailed
  shortMessageWordCount: 8, // messages averaging below this = driver (terse, direct)
};

// ---------------------------------------------------------------------------
// Company / budget analysis (companyAnalyzer.js)
// ---------------------------------------------------------------------------

// Rough monthly-budget-equivalent USD thresholds for bucketing a free-text
// budget mention into a BudgetLevel — intentionally approximate (sales
// conversations rarely state precise, comparable figures), documented as
// such rather than presented as exact.
export const BUDGET_LEVEL_THRESHOLDS_USD = {
  LOW: 5_000,
  MEDIUM: 25_000,
  HIGH: 100_000,
  // ENTERPRISE: anything at/above HIGH
};

// ---------------------------------------------------------------------------
// Lead scoring (leadScoring.js)
// ---------------------------------------------------------------------------

// buyingProbability is a weighted blend of the other three scores — weighted
// toward interest/engagement (the strongest observable buying signals)
// with trust as a secondary confidence modifier.
export const BUYING_PROBABILITY_WEIGHTS = {
  interestScore: 0.35,
  engagementScore: 0.35,
  trustScore: 0.3,
};

// buyingProbability -> letter grade. Evaluated top-down, first match wins.
export const LEAD_GRADE_THRESHOLDS = [
  { min: 90, grade: 'A_PLUS' },
  { min: 75, grade: 'A' },
  { min: 60, grade: 'B_PLUS' },
  { min: 40, grade: 'B' },
  { min: 20, grade: 'C' },
  { min: 0, grade: 'D' },
];

// interestScore -> IntentLevel (reuses the existing IntentLevel enum vocabulary).
export const INTENT_LEVEL_THRESHOLDS = [
  { min: 75, level: 'VERY_HIGH' },
  { min: 50, level: 'HIGH' },
  { min: 25, level: 'MEDIUM' },
  { min: 0, level: 'LOW' },
];

// How much each raw data source contributes to profile confidence (0-1) —
// a profile built from one page view and no conversation should never read
// as equally confident as one built from a full call transcript.
export const CONFIDENCE_WEIGHTS = {
  behaviorEvents: 0.3, // scaled by event count, capped
  sessions: 0.15, // scaled by session count, capped
  messages: 0.35, // scaled by message count, capped
  leadFieldsCaptured: 0.2, // scaled by how many Lead fields are filled in
};
export const CONFIDENCE_BEHAVIOR_EVENTS_FULL_CREDIT = 20;
export const CONFIDENCE_SESSIONS_FULL_CREDIT = 3;
export const CONFIDENCE_MESSAGES_FULL_CREDIT = 12;
export const CONFIDENCE_LEAD_FIELDS_TOTAL = 8; // name, email, company, industry, companySize, budget, timeline, teamSize

// ---------------------------------------------------------------------------
// Personality classification (personalityAnalyzer.js)
// ---------------------------------------------------------------------------

export const RESEARCHER_MIN_SESSIONS = 3; // repeat visits with no conversion yet -> researcher
export const STUDENT_MAX_INTEREST_SCORE = 20; // very low signal + generic browsing -> student/tire-kicker
export const EXPLORER_MAX_SESSIONS = 1; // single session, broad low-intent browsing -> explorer

// Presence of these terms in a visitor's own messages is a strong signal of
// a technical evaluator rather than a business-outcome-focused buyer.
export const TECHNICAL_KEYWORDS = [
  'api',
  'integration',
  'sdk',
  'webhook',
  'database',
  'architecture',
  'infrastructure',
  'security',
  'authentication',
  'latency',
  'uptime',
  'sso',
  'encryption',
  'deploy',
  'self-host',
  'on-prem',
];

// Presence of these terms is a strong signal of a business/ROI-focused buyer.
export const BUSINESS_KEYWORDS = ['roi', 'revenue', 'cost saving', 'efficiency', 'headcount', 'budget', 'timeline', 'business case', 'stakeholder'];

// ---------------------------------------------------------------------------
// Recommendation engine (recommendationEngine.js)
// ---------------------------------------------------------------------------

export const RECOMMENDATION_THRESHOLDS = {
  demoBuyingProbability: 50,
  freeTrialBuyingProbability: 35,
  followUpCallBuyingProbability: 20,
  scheduleMeetingBuyingProbability: 65,
};

// ---------------------------------------------------------------------------
// Memory / continuity (memoryManager.js)
// ---------------------------------------------------------------------------

// A profile younger than this is considered still fresh enough to reuse
// without rebuilding, unless the caller explicitly forces a rebuild.
export const PROFILE_FRESH_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
