/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Nexora AI design system — cool-neutral (bg/surface/ink) with a
      // blue accent family. Token NAMES (bronze/coffee/mocha/champagne)
      // are kept from the earlier warm-brown palette on purpose — they're
      // used in ~100+ places across the app as the accent scale
      // (mid/dark/darkest/light-tint), and renaming every call site would
      // be pure churn for zero functional gain. Only the VALUES changed,
      // to the enterprise-blue palette: accent=#2563EB, bronze=#3B82F6
      // (secondary), coffee=#1E40AF (deep), mocha=#1E3A8A (deepest,
      // gradient/shadow end), champagne=#60A5FA (light tint/glow).
      colors: {
        bg: '#F8FBFF',
        'bg-alt': '#EEF4FE',
        surface: '#FFFFFF',
        'surface-raised': '#ffffff',
        ink: {
          DEFAULT: '#111827',
          2: '#374151',
          faint: '#6B7280',
        },
        // Solid, not alpha-blended, so a card border reads identically
        // whether it sits on `bg` or `surface` — previously an
        // rgba(75,54,40,0.12) wash that rendered two subtly different
        // border colors depending on what was behind it.
        line: '#DCE6F5',
        'line-strong': 'rgba(30, 64, 175, 0.45)',
        // Distinct from `line` (interactive-element/card borders) —
        // `divider` is for passive section separators (hr, list-row
        // borders). Values are close by design (same cool-neutral hairline
        // family); the split exists for semantic correctness, not to look
        // dramatically different.
        divider: '#E7EEFA',
        accent: '#2563EB',
        bronze: '#3B82F6',
        coffee: '#1E40AF',
        mocha: '#1E3A8A',
        champagne: '#60A5FA',
        // Warning is darkened from the given #c58a00 (2.7:1 against `bg`,
        // fails AA) to #8f6200 (4.8:1) — same amber identity, readable as
        // text. Success/Error/Info all clear 4.5:1+ at the given values.
        success: '#2e7d32',
        warning: '#8f6200',
        critical: '#c62828',
        info: '#1565c0',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // Flat-by-default, shadow-on-interaction — the app-wide elevation
        // rule. ambient = persistent chrome only (sidebar); hover = the
        // interaction state on cards/tiles; overlay = modals/dropdowns.
        ambient: '0 1px 2px rgba(42, 33, 27, 0.06), 0 16px 40px -18px rgba(42, 33, 27, 0.28)',
        hover: '0 4px 10px -4px rgba(42, 33, 27, 0.2), 0 24px 48px -20px rgba(42, 33, 27, 0.42)',
        overlay: '0 8px 16px -8px rgba(42, 33, 27, 0.3), 0 28px 64px -20px rgba(42, 33, 27, 0.48), 0 0 0 1px rgba(42, 33, 27, 0.07)',
        bloom: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.15), 0 14px 26px -14px rgba(42, 33, 27, 0.58)',
      },
      borderRadius: {
        xl2: '1.75rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        drift: 'drift 32s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0,0,0) scale(1)' },
          '100%': { transform: 'translate3d(-2%,1.5%,0) scale(1.04)' },
        },
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
