/**
 * Pure, dependency-free helper functions shared across the Customer DNA
 * module's analyzers. Nothing in this file touches the database, the LLM,
 * or any other service — kept that way so every analyzer that imports it
 * stays independently unit-testable.
 */

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function roundTo(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function average(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

export function safeDivide(numerator, denominator, fallback = 0) {
  return denominator > 0 ? numerator / denominator : fallback;
}

export function daysBetween(earlier, later = new Date()) {
  if (!earlier) return Infinity;
  return (new Date(later).getTime() - new Date(earlier).getTime()) / (1000 * 60 * 60 * 24);
}

/** Counts occurrences of `keyFn(item)` and returns entries sorted by count, descending. */
export function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (key == null) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/** Top N most frequent keys from countBy, keys only. */
export function topByCount(items, keyFn, limit) {
  return countBy(items, keyFn)
    .slice(0, limit)
    .map(([key]) => key);
}

/** De-duplicates a list of strings while preserving first-seen order. */
export function uniqueInOrder(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    if (value == null || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

/** True if `text` contains any Devanagari script characters (used for Hindi detection). */
export function containsDevanagari(text) {
  return /[ऀ-ॿ]/.test(text ?? '');
}

/** Splits text into rough sentences for lightweight linguistic analysis (question counting, etc). */
export function splitSentences(text) {
  return (text ?? '')
    .split(/(?<=[.!?।॥])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Extracts the first currency-like amount mentioned in text, e.g. "$10k", "₹5,00,000", "10000 dollars". */
const CURRENCY_AMOUNT_RE = /(?:[$₹€£]|Rs\.?)\s?([\d,]+(?:\.\d+)?)\s?(k|K|lakh|lakhs|crore|crores|m|M)?/;
export function extractCurrencyAmount(text) {
  const match = CURRENCY_AMOUNT_RE.exec(text ?? '');
  if (!match) return null;

  const raw = parseFloat(match[1].replace(/,/g, ''));
  if (Number.isNaN(raw)) return null;

  const unit = (match[2] ?? '').toLowerCase();
  const multiplier = unit === 'k' ? 1_000 : unit === 'm' ? 1_000_000 : unit === 'lakh' || unit === 'lakhs' ? 100_000 : unit === 'crore' || unit === 'crores' ? 10_000_000 : 1;

  return raw * multiplier;
}
