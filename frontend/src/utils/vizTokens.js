// Nexora AI light-mode data-viz palette, re-surfaced against this product's
// actual cool-neutral background (#FFFFFF) as part of the full design
// system rebuild. No `scripts/validate_palette.js` exists in this repo (the
// prior comment referencing it pointed at a design-skill tool, not a
// runnable file here) — these 8 were hand-checked for contrast against the
// light surface and mutual distinguishability, built around the app's own
// bronze/coffee/mocha family (now a blue family — token names unchanged,
// see tailwind.config.js) plus a few desaturated complements so
// multi-series charts stay legible without turning garish. The 3 that are
// literally the brand accent family (bronze/coffee/mocha) are kept in sync
// with the global token recalibration; the 5 complementary hues are
// untouched since they were never part of the brand palette and changing
// them without re-running the distinguishability check would be a guess.
export const CATEGORICAL = ['#3B82F6', '#1E40AF', '#6b8f5a', '#5e7a8c', '#c62828', '#c79a6b', '#1E3A8A', '#8c6e7a'];

// Aligned to the app-wide Success/Warning/Error tokens (see
// tailwind.config.js) rather than a separate hand-tuned set — one status
// vocabulary everywhere. `serious` sits between warning and critical for
// callers that want a 4th tier; scoreSeverity() below only uses 3.
export const STATUS = {
  good: '#2e7d32',
  warning: '#8f6200',
  serious: '#a8420f',
  critical: '#c62828',
};

export const CHART_CHROME = {
  surface: '#FFFFFF',
  primaryInk: '#111827',
  secondaryInk: '#374151',
  mutedInk: '#4B5563',
  gridline: 'rgba(17, 24, 39, 0.08)',
  baseline: 'rgba(17, 24, 39, 0.16)',
};

export const SEQUENTIAL_BLUE = ['#eef2f4', '#d5e0e5', '#b3c6cf', '#8fa9b6', '#6c8c9c', '#54717f', '#3d5460'];

/** Maps a 0-100 score to a status color + tier label — never color alone. */
export function scoreSeverity(value) {
  if (value >= 70) return { color: STATUS.good, label: 'High' };
  if (value >= 40) return { color: STATUS.warning, label: 'Medium' };
  return { color: STATUS.critical, label: 'Low' };
}
