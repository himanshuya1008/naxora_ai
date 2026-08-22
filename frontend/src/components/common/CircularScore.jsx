import { motion } from 'framer-motion';
import { scoreSeverity } from '../../utils/vizTokens.js';

/**
 * SVG ring progress indicator for a 0-100 score. Same severity palette and
 * "never color alone" rule as ScoreMeter.jsx (the linear bar meter used in
 * the live voice call panel) — this is the compact/circular alternative for
 * places that need a denser layout, e.g. a grid of Customer DNA scores.
 */
export default function CircularScore({ value, label, size = 96, strokeWidth = 8, icon: Icon }) {
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  const { color, label: tier } = scoreSeverity(clamped);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`${color}22`} strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {Icon && <Icon className="mb-0.5 h-3.5 w-3.5" style={{ color }} />}
          <span className="text-lg font-bold text-ink">{clamped}</span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-xs font-medium text-ink-faint">{label}</p>
          <p className="text-[11px] font-medium" style={{ color }}>
            {tier}
          </p>
        </div>
      )}
    </div>
  );
}
