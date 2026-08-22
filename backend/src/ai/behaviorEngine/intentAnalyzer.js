import {
  EVENT_TYPE_WEIGHTS,
  EVENT_TYPE_CAP,
  REPEAT_SESSION_BONUS,
  REPEAT_SESSION_BONUS_CAP,
  SCROLL_DEPTH_BONUS_MAX,
  PRICING_DWELL_BONUS_MAX,
  PRICING_DWELL_FULL_CREDIT_SECONDS,
  RECENCY_HALF_LIFE_DAYS,
  HIGH_INTENT_EVENT_TYPES,
} from './scoringConfig.js';

function recencyMultiplier(occurredAt, now) {
  const ageDays = (now - new Date(occurredAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Deterministic, explainable scoring — every point is traceable to a specific
 * signal, which matters for a sales tool ("why is this lead hot?").
 */
function computeInterestScore({ events, sessionCount, scrollDepthAvg, pricingDwellSeconds, now }) {
  const perTypeRaw = {};

  for (const event of events) {
    const weight = EVENT_TYPE_WEIGHTS[event.type] ?? 0;
    if (weight === 0) continue;
    const decayed = weight * recencyMultiplier(event.occurredAt, now);
    perTypeRaw[event.type] = (perTypeRaw[event.type] ?? 0) + decayed;
  }

  let eventScore = 0;
  for (const [type, raw] of Object.entries(perTypeRaw)) {
    const cap = EVENT_TYPE_CAP[type] ?? raw;
    eventScore += Math.min(raw, cap);
  }

  const sessionBonus = Math.min((sessionCount - 1) * REPEAT_SESSION_BONUS, REPEAT_SESSION_BONUS_CAP);
  const scrollBonus = clamp(scrollDepthAvg, 0, 100) * (SCROLL_DEPTH_BONUS_MAX / 100);
  const pricingDwellBonus =
    Math.min(pricingDwellSeconds, PRICING_DWELL_FULL_CREDIT_SECONDS) *
    (PRICING_DWELL_BONUS_MAX / PRICING_DWELL_FULL_CREDIT_SECONDS);

  const total = eventScore + sessionBonus + scrollBonus + pricingDwellBonus;
  return Math.round(clamp(total, 0, 100));
}

function inferDecisionStage({ events }) {
  const types = new Set(events.map((e) => e.type));
  const hasHighIntent = [...types].some((t) => HIGH_INTENT_EVENT_TYPES.has(t));
  const hasConsideration = types.has('PRODUCT_VIEW') || types.has('CASE_STUDY_VIEW');
  const hasAwareness = types.has('PAGE_VIEW') || types.has('FAQ_VIEW');

  if (types.has('FORM_SUBMIT') || (types.has('ENTERPRISE_VIEW') && types.has('PRICING_VIEW'))) {
    return 'DECISION';
  }
  if (hasHighIntent || hasConsideration) return 'CONSIDERATION';
  if (hasAwareness) return 'AWARENESS';
  return 'AWARENESS';
}

function inferProductPreference(events) {
  const counts = new Map();
  for (const event of events) {
    if (event.type !== 'PRODUCT_VIEW' || !event.label) continue;
    counts.set(event.label, (counts.get(event.label) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function extractPainPointSignals(events) {
  // Search terms and FAQ topics are the closest proxy we have to an explicit
  // stated need/problem without asking the visitor anything.
  return events
    .filter((e) => (e.type === 'SEARCH' || e.type === 'FAQ_VIEW') && e.label)
    .map((e) => e.label)
    .filter((label, index, arr) => arr.indexOf(label) === index)
    .slice(0, 10);
}

function extractJourney(events) {
  return [...events]
    .sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt))
    .map((e) => ({ type: e.type, page: e.page, occurredAt: e.occurredAt }));
}

function pricingDwellSeconds(events) {
  return events
    .filter((e) => e.type === 'PRICING_VIEW' && typeof e.value === 'number')
    .reduce((sum, e) => sum + e.value, 0);
}

// `events` arrives sorted most-recent-first (see behaviorSummaryService.js's
// `orderBy: { occurredAt: 'desc' }`) — these three rely on that ordering.
function extractCurrentPage(events) {
  return events[0]?.page ?? null;
}

function extractPreviousPages(events, currentPage) {
  const seen = new Set();
  const pages = [];
  for (const event of events) {
    if (!event.page || event.page === currentPage || seen.has(event.page)) continue;
    seen.add(event.page);
    pages.push(event.page);
    if (pages.length >= 10) break;
  }
  return pages;
}

function extractServicesViewed(events) {
  const seen = new Set();
  const services = [];
  for (const event of events) {
    if (event.type !== 'SERVICE_VIEW' || !event.label || seen.has(event.label)) continue;
    seen.add(event.label);
    services.push(event.label);
  }
  return services;
}

function computeSessionDurationSeconds(sessions, now) {
  if (sessions.length === 0) return 0;
  const latest = sessions[0];
  if (!latest.endedAt) {
    return Math.round((now - new Date(latest.startedAt).getTime()) / 1000);
  }
  return latest.durationSeconds ?? 0;
}

/**
 * Builds a full behavior summary for a visitor from their raw events + session
 * history. This is the single source of truth consumed by both the live
 * Interest Score (dashboard) and the Customer DNA Generator prompt.
 */
export function analyzeBehavior({ events, sessions }) {
  const now = Date.now();
  const scrollDepthAvg =
    sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.scrollDepthAvg, 0) / sessions.length : 0;

  const interestScore = computeInterestScore({
    events,
    sessionCount: sessions.length,
    scrollDepthAvg,
    pricingDwellSeconds: pricingDwellSeconds(events),
    now,
  });

  const currentPage = extractCurrentPage(events);

  return {
    interestScore,
    decisionStage: inferDecisionStage({ events }),
    productPreference: inferProductPreference(events),
    painPointSignals: extractPainPointSignals(events),
    journey: extractJourney(events),
    sessionCount: sessions.length,
    totalEvents: events.length,
    scrollDepthAvg: Math.round(scrollDepthAvg),
    pricingDwellSeconds: pricingDwellSeconds(events),
    highIntentSignalCount: events.filter((e) => HIGH_INTENT_EVENT_TYPES.has(e.type)).length,
    lastActiveAt: sessions.length > 0 ? sessions[0].startedAt : null,
    // Explicit context-awareness signals — what the AI needs to reference the
    // visitor's actual session naturally ("I see you're comparing plans...")
    // instead of only ever getting the coarser DNA profile.
    currentPage,
    previousPages: extractPreviousPages(events, currentPage),
    servicesViewed: extractServicesViewed(events),
    sessionDurationSeconds: computeSessionDurationSeconds(sessions, now),
  };
}
