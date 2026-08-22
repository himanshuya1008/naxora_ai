import clsx from 'clsx';

const TONE_CLASS = {
  neutral: 'bg-champagne/15 text-ink-2 border-line',
  good: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/10 text-warning border-warning/25',
  critical: 'bg-critical/10 text-critical border-critical/25',
  accent: 'bg-bronze/10 text-coffee border-bronze/25',
};

const DOT_CLASS = {
  neutral: 'bg-ink-faint',
  good: 'bg-success',
  warning: 'bg-warning',
  critical: 'bg-critical',
  accent: 'bg-bronze',
};

// `dot` is opt-in and defaults to false, so every existing call site keeps
// rendering exactly as before — this only adds a status-dot variant for
// places that want one (e.g. live/connection-style badges).
export default function Badge({ tone = 'neutral', dot = false, className, children }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', TONE_CLASS[tone], className)}>
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full', DOT_CLASS[tone])} />}
      {children}
    </span>
  );
}
