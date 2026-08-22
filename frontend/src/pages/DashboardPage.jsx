import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Users, Radio, Target, TrendingUp, UserPlus, Calendar, Mic, Activity, CalendarCheck, FileCheck } from 'lucide-react';
import { getOverview, getTrends, getLeadAnalytics } from '../services/analyticsService.js';
import { listVisitors } from '../services/visitorService.js';
import { getErrorMessage } from '../utils/errors.js';
import { isDemoMode } from '../utils/demoMode.js';
import { mockOverview, mockVisitors, mockTrends, mockLeadAnalytics } from '../services/mock/mockData.js';
import StatTile from '../components/common/StatTile.jsx';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import VisitorsTable from '../components/dashboard/VisitorsTable.jsx';
import SalesFunnel from '../components/analytics/SalesFunnel.jsx';
import TrendChart from '../components/analytics/TrendChart.jsx';
import { CATEGORICAL, scoreSeverity } from '../utils/vizTokens.js';

const STAGE_FILTERS = [
  { value: undefined, label: 'All' },
  { value: 'AWARENESS', label: 'Awareness' },
  { value: 'CONSIDERATION', label: 'Consideration' },
  { value: 'DECISION', label: 'Decision' },
];
const STAGE_TONE = { AWARENESS: 'neutral', CONSIDERATION: 'accent', DECISION: 'good' };

function StatTilesSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <GlassCard key={i} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16" />
        </GlassCard>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-line/60 pb-3 last:border-0 last:pb-0">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

const EVENT_LABELS = {
  SERVICE_VIEW: 'Viewed service',
  PRICING_VIEW: 'Viewed pricing',
  CASE_STUDY_VIEW: 'Viewed case study',
  DEMO_REQUEST: 'Requested a demo',
  FORM_SUBMIT: 'Submitted a form',
  PAGE_VIEW: 'Viewed page',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState(null);
  const [visitors, setVisitors] = useState(null);
  const [visitorsError, setVisitorsError] = useState(null);
  const [topLeads, setTopLeads] = useState(null);
  const [topLeadsError, setTopLeadsError] = useState(null);
  const [visitorTrend, setVisitorTrend] = useState(null);
  const [visitorTrendError, setVisitorTrendError] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [timelineError, setTimelineError] = useState(null);
  const [stageFilter, setStageFilter] = useState(undefined);

  const loadOverview = useCallback(() => {
    setOverviewError(null);
    getOverview()
      .then(setOverview)
      .catch((err) => setOverviewError(getErrorMessage(err, 'Failed to load the dashboard overview.')));
  }, []);

  const loadVisitors = useCallback(() => {
    setVisitors(null);
    setVisitorsError(null);
    listVisitors({ sortBy: 'interestScore', pageSize: 20, decisionStage: stageFilter })
      .then((res) => setVisitors(res.visitors))
      .catch((err) => setVisitorsError(getErrorMessage(err, 'Failed to load visitors.')));
  }, [stageFilter]);

  const loadTopLeads = useCallback(() => {
    setTopLeadsError(null);
    listVisitors({ sortBy: 'interestScore', pageSize: 5 })
      .then((res) => setTopLeads(res.visitors))
      .catch((err) => setTopLeadsError(getErrorMessage(err, 'Failed to load top leads.')));
  }, []);

  const loadVisitorTrend = useCallback(() => {
    setVisitorTrendError(null);
    getTrends(7)
      .then((t) => setVisitorTrend(t.visitorsByDay ?? []))
      .catch((err) => setVisitorTrendError(getErrorMessage(err, 'Failed to load the visitor trend chart.')));
  }, []);

  const loadTimeline = useCallback(() => {
    setTimelineError(null);
    getLeadAnalytics()
      .then((res) => setTimeline(res.visitorTimeline))
      .catch((err) => setTimelineError(getErrorMessage(err, 'Failed to load the visitor timeline.')));
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  useEffect(() => {
    loadTopLeads();
  }, [loadTopLeads]);

  useEffect(() => {
    loadVisitorTrend();
  }, [loadVisitorTrend]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  // Belt-and-suspenders: the service layer already falls back to mock data
  // on a failed request in demo mode (see services/*.js + utils/demoMode.js),
  // so none of these *Error states should ever actually be set while
  // isDemoMode is true. If something upstream still leaves one set, demo
  // mode must never show the error screen — fall back to the mock fixture
  // directly here instead, per the explicit "no error screen in demo mode"
  // requirement, rather than relying on a single layer to get it right.
  const effectiveOverview = overview ?? (isDemoMode && overviewError ? mockOverview : null);
  const effectiveOverviewError = isDemoMode ? null : overviewError;
  const effectiveVisitors = visitors ?? (isDemoMode && visitorsError ? mockVisitors : null);
  const effectiveVisitorsError = isDemoMode ? null : visitorsError;
  const effectiveTopLeads = topLeads ?? (isDemoMode && topLeadsError ? mockVisitors.slice(0, 5) : null);
  const effectiveTopLeadsError = isDemoMode ? null : topLeadsError;
  const effectiveVisitorTrend = visitorTrend ?? (isDemoMode && visitorTrendError ? mockTrends(7).visitorsByDay : null);
  const effectiveVisitorTrendError = isDemoMode ? null : visitorTrendError;
  const effectiveTimeline = timeline ?? (isDemoMode && timelineError ? mockLeadAnalytics.visitorTimeline : null);
  const effectiveTimelineError = isDemoMode ? null : timelineError;

  if (effectiveOverviewError) {
    return <ErrorState description={effectiveOverviewError} onRetry={loadOverview} />;
  }

  const qualifiedLeads = effectiveOverview?.qualifiedLeads ?? 0;
  const conversionRate =
    effectiveOverview && effectiveOverview.totalVisitors > 0
      ? Math.round((effectiveOverview.totalConversations / effectiveOverview.totalVisitors) * 1000) / 10
      : 0;

  const funnelStages = effectiveOverview
    ? [
        { name: 'Visitors', value: effectiveOverview.totalVisitors, fill: CATEGORICAL[0] },
        { name: 'Conversations', value: effectiveOverview.totalConversations, fill: CATEGORICAL[1] },
        { name: 'Leads generated', value: effectiveOverview.leadsGenerated, fill: CATEGORICAL[2] },
        { name: 'Qualified leads', value: qualifiedLeads, fill: CATEGORICAL[3] },
      ]
    : [];

  return (
    <AnimatePresence mode="wait">
      {!effectiveOverview ? (
        <motion.div key="skeleton" exit={{ opacity: 0 }} className="flex flex-col gap-6">
          <StatTilesSkeleton />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GlassCard>
              <Skeleton className="mb-4 h-4 w-28" />
              <Skeleton className="h-[260px] w-full" />
            </GlassCard>
            <GlassCard>
              <Skeleton className="mb-4 h-4 w-28" />
              <Skeleton className="h-[220px] w-full" />
            </GlassCard>
          </div>
          <GlassCard>
            <TableSkeleton />
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Total visitors" value={effectiveOverview.totalVisitors} icon={Users} color={CATEGORICAL[0]} />
            <StatTile label="Active visitors" value={effectiveOverview.activeVisitors} icon={Activity} color={CATEGORICAL[1]} />
            <StatTile label="Active conversations" value={effectiveOverview.activeConversations} icon={Radio} color={CATEGORICAL[2]} />
            <StatTile label="Leads generated" value={effectiveOverview.leadsGenerated} icon={UserPlus} color={CATEGORICAL[3]} />
            <StatTile label="Qualified leads" value={qualifiedLeads} icon={Target} color={CATEGORICAL[4]} />
            <StatTile label="Conversion rate" value={`${conversionRate}%`} icon={TrendingUp} color={CATEGORICAL[5]} />
            <StatTile label="Demo requests" value={effectiveOverview.demoRequests} icon={CalendarCheck} color={CATEGORICAL[6]} />
            <StatTile label="Reports generated" value={effectiveOverview.reportsGenerated} icon={FileCheck} color={CATEGORICAL[7]} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GlassCard>
              <h2 className="mb-1 card-title">Visitor trend</h2>
              <p className="mb-4 card-subtitle">Last 7 days</p>
              {effectiveVisitorTrendError ? (
                <ErrorState description={effectiveVisitorTrendError} onRetry={loadVisitorTrend} />
              ) : !effectiveVisitorTrend ? (
                <Skeleton className="h-[220px] w-full" />
              ) : effectiveVisitorTrend.length === 0 ? (
                <EmptyState title="No visitor trend data yet" />
              ) : (
                <TrendChart data={effectiveVisitorTrend} dataKey="count" valueLabel="Visitors" color={CATEGORICAL[0]} />
              )}
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 card-title">Sales funnel</h2>
              <SalesFunnel stages={funnelStages} />
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <GlassCard className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="card-title">Recent visitors</h2>
                <div className="flex gap-1.5">
                  {STAGE_FILTERS.map((f) => (
                    <button
                      key={f.label}
                      onClick={() => setStageFilter(f.value)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        stageFilter === f.value ? 'bg-champagne/25 text-coffee' : 'text-ink-faint hover:bg-champagne/10'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              {effectiveVisitorsError ? (
                <ErrorState description={effectiveVisitorsError} onRetry={loadVisitors} />
              ) : effectiveVisitors ? (
                <VisitorsTable visitors={effectiveVisitors} />
              ) : (
                <TableSkeleton />
              )}
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 card-title">Top leads</h2>
              {effectiveTopLeadsError ? (
                <ErrorState description={effectiveTopLeadsError} onRetry={loadTopLeads} />
              ) : !effectiveTopLeads ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : effectiveTopLeads.length === 0 ? (
                <EmptyState title="No leads yet" />
              ) : (
                <ul className="flex flex-col divide-y divide-line/60">
                  {effectiveTopLeads.map((lead) => {
                    const severity = scoreSeverity(lead.interestScore);
                    return (
                      <li key={lead.id}>
                        <button
                          onClick={() => navigate(`/app/visitors/${lead.id}`)}
                          className="flex w-full items-center justify-between gap-2 py-2.5 text-left hover:bg-champagne/10"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{lead.name ?? 'Anonymous visitor'}</p>
                            <p className="truncate text-xs text-ink-faint">{lead.company ?? lead.email ?? '—'}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: severity.color }}>
                              {lead.interestScore}
                            </span>
                            <Badge tone={STAGE_TONE[lead.decisionStage] ?? 'neutral'}>{lead.decisionStage}</Badge>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Button variant="ghost" onClick={() => navigate('/app/conversation')} className="mt-3 w-full justify-center">
                <Mic className="h-4 w-4" />
                Start a conversation
              </Button>
            </GlassCard>
          </div>

          <GlassCard>
            <h2 className="mb-1 card-title">Visitor timeline</h2>
            <p className="mb-4 card-subtitle">Recent activity across every tracked visitor</p>
            {effectiveTimelineError ? (
              <ErrorState description={effectiveTimelineError} onRetry={loadTimeline} />
            ) : !effectiveTimeline ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : effectiveTimeline.length === 0 ? (
              <EmptyState icon={Calendar} title="No activity recorded yet" />
            ) : (
              <ol className="flex flex-col gap-3">
                {effectiveTimeline.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-center justify-between border-b border-line/60 pb-3 text-sm last:border-0 last:pb-0"
                  >
                    <div>
                      <span className="font-medium text-ink-2">{event.visitor?.name ?? event.visitor?.company ?? 'Anonymous visitor'}</span>
                      <span className="ml-2 text-xs text-ink-faint">
                        {EVENT_LABELS[event.type] ?? event.type} {event.label ? `— ${event.label}` : ''}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-ink-faint">{formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true })}</span>
                  </li>
                ))}
              </ol>
            )}
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
