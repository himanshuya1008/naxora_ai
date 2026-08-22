import { motion } from 'framer-motion';
import { scoreSeverity } from '../../utils/vizTokens.js';

/**
 * A 0-100 magnitude stat as a labeled number + meter bar, per the dataviz
 * meter spec: fill carries severity, the unfilled track is a lighter wash of
 * the same color (not a neutral gray) so state reads across the whole bar.
 * Severity is never color-alone — the tier label always accompanies it.
 */
export default function ScoreMeter({ label, value, icon: Icon }) {
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  const { color, label: tier } = scoreSeverity(clamped);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-ink-faint">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {label}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-ink">{clamped}</span>
          <span className="text-xs font-medium" style={{ color }}>
            {tier}
          </span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: `${color}26` }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
