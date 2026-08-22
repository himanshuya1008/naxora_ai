import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_CHROME, CATEGORICAL } from '../../utils/vizTokens.js';

function BarTooltip({ active, payload, labelKey, valueLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-xs shadow-overlay">
      <p className="mb-1 text-ink-faint">{payload[0].payload[labelKey]}</p>
      <p className="font-medium text-ink">
        {valueLabel}: {payload[0].value}
      </p>
    </div>
  );
}

/**
 * Horizontal categorical bar chart — used for objection breakdown so it
 * reads as a chart rather than a plain list, per-bar colored from the
 * validated CATEGORICAL palette (same source as StatTile icon colors).
 */
export default function CategoryBarChart({ data, labelKey, valueKey, valueLabel }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={CHART_CHROME.gridline} horizontal={false} />
        <XAxis type="number" tick={{ fill: CHART_CHROME.mutedInk, fontSize: 11 }} axisLine={{ stroke: CHART_CHROME.baseline }} tickLine={false} />
        <YAxis type="category" dataKey={labelKey} width={110} tick={{ fill: CHART_CHROME.secondaryInk, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<BarTooltip labelKey={labelKey} valueLabel={valueLabel} />} cursor={{ fill: 'rgba(17,24,39,0.04)' }} />
        <Bar dataKey={valueKey} radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CATEGORICAL[i % CATEGORICAL.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
