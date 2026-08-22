import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { CHART_CHROME } from '../../utils/vizTokens.js';

function ChartTooltip({ active, payload, label, valueLabel, formatValue }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-xs shadow-overlay">
      <p className="mb-1 text-ink-faint">{format(new Date(label), 'MMM d, yyyy')}</p>
      <p className="font-medium text-ink">
        {valueLabel}: {formatValue(payload[0].value)}
      </p>
    </div>
  );
}

/**
 * Single-series time-over-time chart — no legend (the title names the
 * series), hairline recessive gridlines, 10% opacity area wash per the
 * dataviz mark spec, direct color from the validated categorical slot 1.
 */
export default function TrendChart({ data, dataKey, valueLabel, formatValue = (v) => v, color = '#3B82F6' }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_CHROME.gridline} strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey="day"
          tickFormatter={(v) => format(new Date(v), 'MMM d')}
          tick={{ fill: CHART_CHROME.mutedInk, fontSize: 11 }}
          axisLine={{ stroke: CHART_CHROME.baseline }}
          tickLine={false}
        />
        <YAxis tick={{ fill: CHART_CHROME.mutedInk, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
        <Tooltip content={<ChartTooltip valueLabel={valueLabel} formatValue={formatValue} />} cursor={{ stroke: CHART_CHROME.baseline }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#fill-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
