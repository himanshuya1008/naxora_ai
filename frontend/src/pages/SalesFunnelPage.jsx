import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, CheckCircle2 } from 'lucide-react';
import { getOverview } from '../services/analyticsService.js';
import { getErrorMessage } from '../utils/errors.js';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatTile from '../components/common/StatTile.jsx';
import SalesFunnel from '../components/analytics/SalesFunnel.jsx';
import { CATEGORICAL } from '../utils/vizTokens.js';

const STAGE_TONE = { AWARENESS: 'text-ink-2', CONSIDERATION: 'text-bronze', DECISION: 'text-success' };

function FunnelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} className="flex flex-col gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </GlassCard>
        ))}
      </div>
      <GlassCard>
        <Skeleton className="h-[280px] w-full" />
      </GlassCard>
    </div>
  );
}

export default function SalesFunnelPage() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    getOverview()
      .then(setOverview)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load the sales funnel.')));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return <ErrorState description={error} onRetry={load} />;
  }

  if (!overview) {
    return <FunnelSkeleton />;
  }

  if (overview.totalVisitors === 0) {
    return (
      <EmptyState
        icon={Filter}
        title="No funnel data yet"
        description="Your sales funnel builds automatically as visitors browse the site, start conversations, and become leads."
      />
    );
  }

  const stages = [
    { name: 'Visitors', value: overview.totalVisitors, fill: CATEGORICAL[0] },
    { name: 'Conversations', value: overview.totalConversations, fill: CATEGORICAL[1] },
    { name: 'Leads generated', value: overview.leadsGenerated, fill: CATEGORICAL[2] },
    { name: 'Qualified leads', value: overview.qualifiedLeads, fill: CATEGORICAL[3] },
  ];

  // Stage-over-stage conversion, not cumulative-over-total — "what % of the
  // PREVIOUS stage made it to this one" is what tells a rep where the funnel
  // actually leaks.
  const stageConversions = stages.map((stage, i) => {
    const prev = i === 0 ? overview.totalVisitors : stages[i - 1].value;
    const rate = prev > 0 ? Math.round((stage.value / prev) * 1000) / 10 : 0;
    return { ...stage, rate: i === 0 ? null : rate };
  });

  const conversationSuccessRate =
    overview.totalConversations > 0 ? Math.round((overview.reportsGenerated / overview.totalConversations) * 1000) / 10 : 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
            label="Visitor → Lead conversion"
            value={`${overview.totalVisitors > 0 ? Math.round((overview.leadsGenerated / overview.totalVisitors) * 1000) / 10 : 0}%`}
            icon={Filter}
            color={CATEGORICAL[2]}
          />
          <StatTile
            label="Lead → Qualified conversion"
            value={`${overview.leadsGenerated > 0 ? Math.round((overview.qualifiedLeads / overview.leadsGenerated) * 1000) / 10 : 0}%`}
            icon={Filter}
            color={CATEGORICAL[3]}
          />
          <StatTile label="Conversation success rate" value={`${conversationSuccessRate}%`} icon={CheckCircle2} color={CATEGORICAL[4]} />
        </div>

        <GlassCard>
          <h2 className="mb-1 card-title">Sales funnel</h2>
          <p className="mb-4 card-subtitle">Every stage from first visit to qualified lead</p>
          <SalesFunnel stages={stages} />
        </GlassCard>

        <GlassCard>
          <h2 className="mb-1 card-title">Stage-by-stage breakdown</h2>
          <p className="mb-4 card-subtitle">Conversion rate from the previous stage</p>
          <div className="flex flex-col divide-y divide-line/60">
            {stageConversions.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink-2">{s.name}</span>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-ink">{s.value.toLocaleString()}</span>
                  {s.rate != null && <span className="w-14 text-right text-xs text-ink-faint">{s.rate}%</span>}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-1 card-title">Leads by decision stage</h2>
          <p className="mb-4 card-subtitle">Where tracked visitors currently sit in their buying journey</p>
          {overview.leadsByStage.length === 0 ? (
            <EmptyState title="No visitors tracked yet" />
          ) : (
            <div className="flex flex-col gap-2">
              {overview.leadsByStage.map((s) => (
                <div key={s.stage} className="flex items-center justify-between border-b border-line/60 py-2 text-sm last:border-0">
                  <span className={STAGE_TONE[s.stage] ?? 'text-ink-2'}>{s.stage}</span>
                  <span className="font-medium text-ink">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
