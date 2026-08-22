import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_CHROME } from '../../utils/vizTokens.js';

function FunnelTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-xs shadow-overlay">
      <p className="font-medium text-ink">{name}</p>
      <p className="text-ink-faint">{value.toLocaleString()} visitors</p>
    </div>
  );
}

/**
 * Stage-by-stage drop-off, built entirely from fields the real overview
 * endpoint already returns (totalVisitors / totalConversations / DECISION
 * count / reportsGenerated) — no new backend field required.
 */
export default function SalesFunnel({ stages }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <FunnelChart>
        <Tooltip content={<FunnelTooltip />} />
        <Funnel dataKey="value" data={stages} isAnimationActive>
          <LabelList position="right" dataKey="name" fill={CHART_CHROME.secondaryInk} stroke="none" fontSize={12} />
          <LabelList
            position="center"
            dataKey="value"
            fill={CHART_CHROME.primaryInk}
            stroke="none"
            fontSize={13}
            fontWeight={600}
            formatter={(v) => v.toLocaleString()}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
