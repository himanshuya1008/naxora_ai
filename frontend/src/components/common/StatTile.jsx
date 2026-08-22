import clsx from 'clsx';
import GlassCard from './GlassCard.jsx';

function formatCompact(value) {
  if (typeof value !== 'number') return value;
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/**
 * Stat tile contract (dataviz skill): label, auto-compact value, optional
 * signed delta colored by direction × whether up is good. The number is the
 * chart — no gauge/donut for a single magnitude figure.
 */
export default function StatTile({ label, value, icon: Icon, delta, deltaGoodDirection = 'up', color }) {
  const deltaIsGood = delta != null && (deltaGoodDirection === 'up' ? delta >= 0 : delta <= 0);

  return (
    <GlassCard className="group flex flex-col gap-3 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:!border-bronze/30 hover:!shadow-hover">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-faint">{label}</span>
        {Icon && (
          <span
            className={clsx(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 ease-premium group-hover:scale-110',
              !color && 'bg-bronze/10 text-bronze'
            )}
            style={color ? { backgroundColor: `${color}1a`, color } : undefined}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-3xl font-medium text-ink">{formatCompact(value)}</span>
        {delta != null && (
          <span className={clsx('text-xs font-medium', deltaIsGood ? 'text-success' : 'text-critical')}>
            {delta >= 0 ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>
    </GlassCard>
  );
}
