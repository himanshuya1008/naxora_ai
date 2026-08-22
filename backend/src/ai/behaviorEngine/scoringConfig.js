// Tunable weights for the heuristic Behavior Intelligence Engine. Kept as data
// (not scattered magic numbers) so sales/marketing can retune signal strength
// without touching analyzer logic.

export const EVENT_TYPE_WEIGHTS = {
  FORM_SUBMIT: 25,
  ENTERPRISE_VIEW: 20,
  PRICING_VIEW: 15,
  DOWNLOAD: 12,
  CASE_STUDY_VIEW: 10,
  PRODUCT_VIEW: 8,
  VIDEO_PLAY: 8,
  SEARCH: 5,
  FAQ_VIEW: 5,
  PAGE_VIEW: 1,
  SCROLL_DEPTH: 0, // contributes via scrollDepthBonus below, not a flat weight
  CLICK: 1,
};

// Diminishing returns cap per event type so one obsessive page-refresher
// doesn't dominate the score.
export const EVENT_TYPE_CAP = {
  FORM_SUBMIT: 50,
  ENTERPRISE_VIEW: 40,
  PRICING_VIEW: 45,
  DOWNLOAD: 36,
  CASE_STUDY_VIEW: 30,
  PRODUCT_VIEW: 24,
  VIDEO_PLAY: 16,
  SEARCH: 15,
  FAQ_VIEW: 15,
  PAGE_VIEW: 10,
  CLICK: 8,
};

export const REPEAT_SESSION_BONUS = 8; // per additional session, capped below
export const REPEAT_SESSION_BONUS_CAP = 24;

export const SCROLL_DEPTH_BONUS_MAX = 10; // full credit at 100% avg scroll depth
export const PRICING_DWELL_BONUS_MAX = 15; // full credit at >= PRICING_DWELL_FULL_CREDIT_SECONDS
export const PRICING_DWELL_FULL_CREDIT_SECONDS = 240;

export const RECENCY_HALF_LIFE_DAYS = 7; // engagement value halves every 7 days of inactivity

export const HIGH_INTENT_EVENT_TYPES = new Set(['FORM_SUBMIT', 'ENTERPRISE_VIEW', 'PRICING_VIEW', 'DOWNLOAD']);

export const DNA_REGENERATION_EVENT_THRESHOLD = 8; // recompute qualitative DNA every N new events
export const DNA_REGENERATION_MIN_INTERVAL_MS = 5 * 60 * 1000; // ...but never more often than this
