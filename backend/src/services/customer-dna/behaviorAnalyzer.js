import {
  CTA_EVENT_TYPES,
  PRICING_EVENT_TYPES,
  ENGAGEMENT_WEIGHTS,
  ENGAGEMENT_PAGE_VIEWS_FULL_CREDIT,
  ENGAGEMENT_CTA_CLICKS_FULL_CREDIT,
  ENGAGEMENT_PRICING_VISITS_FULL_CREDIT,
  ENGAGEMENT_SESSION_DURATION_FULL_CREDIT_SECONDS,
} from './scoringConfig.js';
import { clamp, uniqueInOrder, average } from './utils.js';

const MAX_PAGE_DWELL_SECONDS = 300; // caps an idle/backgrounded-tab gap from skewing "time on page"

/**
 * Estimates seconds spent on each distinct page from the gap between
 * consecutive events on that page (page-level dwell isn't tracked as its
 * own field on BehaviorEvent — PRICING_VIEW is the one exception, which
 * already carries an explicit dwell value in `value`, used directly here
 * instead of being re-estimated).
 */
function computeTimeOnPage(sortedEvents) {
  const timeOnPage = {};

  for (let i = 0; i < sortedEvents.length; i += 1) {
    const event = sortedEvents[i];
    if (!event.page) continue;

    if (PRICING_EVENT_TYPES.includes(event.type) && typeof event.value === 'number') {
      timeOnPage[event.page] = (timeOnPage[event.page] ?? 0) + event.value;
      continue;
    }

    const next = sortedEvents[i + 1];
    if (!next) continue;

    const gapSeconds = (new Date(next.occurredAt).getTime() - new Date(event.occurredAt).getTime()) / 1000;
    if (gapSeconds <= 0) continue;

    timeOnPage[event.page] = (timeOnPage[event.page] ?? 0) + Math.min(gapSeconds, MAX_PAGE_DWELL_SECONDS);
  }

  return Object.fromEntries(Object.entries(timeOnPage).map(([page, seconds]) => [page, Math.round(seconds)]));
}

function computeEngagementScore({ pageViewCount, ctaClicks, pricingPageVisits, scrollPercentage, sessionDurationSeconds, isReturnVisitor }) {
  const pageViewsCredit = clamp(pageViewCount / ENGAGEMENT_PAGE_VIEWS_FULL_CREDIT, 0, 1) * ENGAGEMENT_WEIGHTS.pageViews;
  const ctaCredit = clamp(ctaClicks / ENGAGEMENT_CTA_CLICKS_FULL_CREDIT, 0, 1) * ENGAGEMENT_WEIGHTS.ctaClicks;
  const pricingCredit = clamp(pricingPageVisits / ENGAGEMENT_PRICING_VISITS_FULL_CREDIT, 0, 1) * ENGAGEMENT_WEIGHTS.pricingVisits;
  const scrollCredit = clamp(scrollPercentage, 0, 100) / 100 * ENGAGEMENT_WEIGHTS.scrollDepth;
  const durationCredit = clamp(sessionDurationSeconds / ENGAGEMENT_SESSION_DURATION_FULL_CREDIT_SECONDS, 0, 1) * ENGAGEMENT_WEIGHTS.sessionDuration;
  const returnCredit = isReturnVisitor ? ENGAGEMENT_WEIGHTS.returnVisitor : 0;

  return Math.round(clamp(pageViewsCredit + ctaCredit + pricingCredit + scrollCredit + durationCredit + returnCredit, 0, 100));
}

/**
 * Pure function: raw website behavior signals (BehaviorEvent[] + Session[])
 * in, a structured behavior profile out. No I/O — the caller (profileBuilder)
 * owns fetching the data.
 */
export function analyzeBehavior({ events, sessions }) {
  const sortedEvents = [...events].sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt));

  const pagesVisited = uniqueInOrder(sortedEvents.map((e) => e.page));
  const timeOnPage = computeTimeOnPage(sortedEvents);
  const mouseClicks = sortedEvents.filter((e) => e.type === 'CLICK').length;
  const pricingPageVisits = sortedEvents.filter((e) => PRICING_EVENT_TYPES.includes(e.type)).length;
  const ctaClicks = sortedEvents.filter((e) => CTA_EVENT_TYPES.includes(e.type)).length;

  // Session.scrollDepthAvg is already the authoritative, persisted per-session
  // aggregate (computed client-side from real scroll position, see
  // frontend/src/services/tracking/behaviorTracker.js) — reused directly
  // rather than re-derived from SCROLL_DEPTH events, which would just be a
  // noisier version of the same number.
  const scrollPercentage = Math.round(average(sessions.map((s) => s.scrollDepthAvg)));

  const latestSession = sessions[0] ?? null;
  const sessionDurationSeconds = latestSession
    ? latestSession.endedAt
      ? latestSession.durationSeconds
      : Math.round((Date.now() - new Date(latestSession.startedAt).getTime()) / 1000)
    : 0;

  const isReturnVisitor = sessions.length > 1;

  const productsInterested = uniqueInOrder(
    sortedEvents.filter((e) => (e.type === 'PRODUCT_VIEW' || e.type === 'SERVICE_VIEW') && e.label).map((e) => e.label)
  );

  const engagementScore = computeEngagementScore({
    pageViewCount: sortedEvents.filter((e) => e.type === 'PAGE_VIEW').length,
    ctaClicks,
    pricingPageVisits,
    scrollPercentage,
    sessionDurationSeconds,
    isReturnVisitor,
  });

  return {
    pagesVisited,
    timeOnPage,
    scrollPercentage,
    mouseClicks,
    pricingPageVisits,
    ctaClicks,
    sessionDurationSeconds,
    isReturnVisitor,
    sessionCount: sessions.length,
    productsInterested,
    engagementScore,
  };
}
