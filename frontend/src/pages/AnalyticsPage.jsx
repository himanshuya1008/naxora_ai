import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Phone, Radio, FileCheck } from 'lucide-react';
import { getOverview, getTrends, getLeadAnalytics } from '../services/analyticsService.js';
import { getErrorMessage } from '../utils/errors.js';
import StatTile from '../components/common/StatTile.jsx';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import TrendChart from '../components/analytics/TrendChart.jsx';
import CategoryBarChart from '../components/analytics/CategoryBarChart.jsx';
import { CATEGORICAL } from '../utils/vizTokens.js';

const STAT_COLORS = [CATEGORICAL[0], CATEGORICAL[1], CATEGORICAL[2], CATEGORICAL[3]];

function StatTilesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
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

function ChartCardSkeleton() {
  return (
    <GlassCard>
      <Skeleton className="mb-1 h-4 w-40" />
      <Skeleton className="mb-4 h-3 w-24" />
      <Skeleton className="h-[220px] w-full" />
    </GlassCard>
  );
}

function ListCardSkeleton() {
  return (
    <GlassCard>
      <Skeleton className="mb-4 h-4 w-40" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between border-b border-line/60 py-1 last:border-0">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// Computed purely from two already-fetched daily series — no dedicated
// "conversion trend" backend field required.
function buildConversionSeries(visitorsByDay, conversationsByDay) {
  if (!visitorsByDay?.length || !conversationsByDay?.length) return [];
  return visitorsByDay.map((v, i) => {
    const conversations = conversationsByDay[i]?.count ?? 0;
    const rate = v.count > 0 ? Math.round((conversations / v.count) * 1000) / 10 : 0;
    return { day: v.day, rate };
  });
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState(null);
  const [trends, setTrends] = useState(null);
  const [trendsError, setTrendsError] = useState(null);
  const [leadAnalytics, setLeadAnalytics] = useState(null);
  const [leadAnalyticsError, setLeadAnalyticsError] = useState(null);

  const loadOverview = useCallback(() => {
    setOverviewError(null);
    getOverview()
      .then(setOverview)
      .catch((err) => setOverviewError(getErrorMessage(err, 'Failed to load analytics overview.')));
  }, []);

  const loadTrends = useCallback(() => {
    setTrendsError(null);
    getTrends(30)
      .then(setTrends)
      .catch((err) => setTrendsError(getErrorMessage(err, 'Failed to load trend data.')));
  }, []);

  const loadLeadAnalytics = useCallback(() => {
    setLeadAnalyticsError(null);
    getLeadAnalytics()
      .then(setLeadAnalytics)
      .catch((err) => setLeadAnalyticsError(getErrorMessage(err, 'Failed to load lead analytics.')));
  }, []);

  useEffect(() => {
    loadOverview();
    loadTrends();
    loadLeadAnalytics();
  }, [loadOverview, loadTrends, loadLeadAnalytics]);

  if (overviewError && trendsError && leadAnalyticsError) {
    return (
      <ErrorState
        description="Failed to load analytics."
        onRetry={() => {
          loadOverview();
          loadTrends();
          loadLeadAnalytics();
        }}
      />
    );
  }

  // "Settled" (either resolved or errored), not "succeeded" — a page where
  // only some of the independent fetches fail must still render (with that
  // section's own ErrorState), not sit on the skeleton forever.
  const overviewSettled = overview !== null || overviewError !== null;
  const trendsSettled = trends !== null || trendsError !== null;
  const leadAnalyticsSettled = leadAnalytics !== null || leadAnalyticsError !== null;
  const settled = overviewSettled && trendsSettled && leadAnalyticsSettled;

  const conversionSeries = trends ? buildConversionSeries(trends.visitorsByDay, trends.conversationsByDay) : [];

  return (
    <AnimatePresence mode="wait">
      {!settled ? (
        <motion.div key="skeleton" exit={{ opacity: 0 }} className="flex flex-col gap-6">
          <StatTilesSkeleton />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCardSkeleton />
            <ChartCardSkeleton />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCardSkeleton />
            <ChartCardSkeleton />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCardSkeleton />
            <ListCardSkeleton />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCardSkeleton />
            <ListCardSkeleton />
          </div>
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
          {overviewError ? (
            <ErrorState description={overviewError} onRetry={loadOverview} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Total visitors" value={overview.totalVisitors} icon={Users} color={STAT_COLORS[0]} />
              <StatTile label="Conversations" value={overview.totalConversations} icon={Phone} color={STAT_COLORS[1]} />
              <StatTile label="Active now" value={overview.activeConversations} icon={Radio} color={STAT_COLORS[2]} />
              <StatTile label="Reports generated" value={overview.reportsGenerated} icon={FileCheck} color={STAT_COLORS[3]} />
            </div>
          )}

          {trendsError ? (
            <ErrorState description={trendsError} onRetry={loadTrends} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <GlassCard>
                  <h3 className="mb-1 card-title">Visitor trends</h3>
                  <p className="mb-4 card-subtitle">Last 30 days</p>
                  {!trends.visitorsByDay?.length ? (
                    <EmptyState title="No visitor trend data yet" />
                  ) : (
                    <TrendChart data={trends.visitorsByDay} dataKey="count" valueLabel="Visitors" color={CATEGORICAL[0]} />
                  )}
                </GlassCard>

                <GlassCard>
                  <h3 className="mb-1 card-title">Conversation trends</h3>
                  <p className="mb-4 card-subtitle">Last 30 days</p>
                  {trends.conversationsByDay.length === 0 ? (
                    <EmptyState title="No conversations yet" />
                  ) : (
                    <TrendChart data={trends.conversationsByDay} dataKey="count" valueLabel="Conversations" color={CATEGORICAL[1]} />
                  )}
                </GlassCard>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <GlassCard>
                  <h3 className="mb-1 card-title">Interest score</h3>
                  <p className="mb-4 card-subtitle">Average per day, last 30 days</p>
                  {!trends.interestScoreByDay?.length ? (
                    <EmptyState title="No interest score data yet" />
                  ) : (
                    <TrendChart
                      data={trends.interestScoreByDay}
                      dataKey="avgInterestScore"
                      valueLabel="Avg. interest score"
                      color={CATEGORICAL[4]}
                    />
                  )}
                </GlassCard>

                <GlassCard>
                  <h3 className="mb-1 card-title">Avg. buying probability</h3>
                  <p className="mb-4 card-subtitle">Last 30 days, from generated reports</p>
                  {trends.buyingProbabilityByDay.length === 0 ? (
                    <EmptyState title="No reports yet" />
                  ) : (
                    <TrendChart
                      data={trends.buyingProbabilityByDay}
                      dataKey="avgBuyingProbability"
                      valueLabel="Avg. buying probability"
                      formatValue={(v) => `${Math.round(v)}%`}
                      color={CATEGORICAL[2]}
                    />
                  )}
                </GlassCard>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <GlassCard>
                  <h3 className="mb-1 card-title">Conversion rate</h3>
                  <p className="mb-4 card-subtitle">Conversations ÷ visitors, per day</p>
                  {conversionSeries.length === 0 ? (
                    <EmptyState title="Not enough data yet" description="Needs both visitor and conversation trend data." />
                  ) : (
                    <TrendChart data={conversionSeries} dataKey="rate" valueLabel="Conversion rate" formatValue={(v) => `${v}%`} color={CATEGORICAL[5]} />
                  )}
                </GlassCard>

                <GlassCard>
                  <h3 className="mb-4 card-title">Objection breakdown</h3>
                  {!overview || overview.objectionBreakdown.length === 0 ? (
                    <EmptyState title="No objections logged yet" />
                  ) : (
                    <CategoryBarChart data={overview.objectionBreakdown} labelKey="type" valueKey="count" valueLabel="Occurrences" />
                  )}
                </GlassCard>
              </div>
            </>
          )}

          {leadAnalyticsError ? (
            <ErrorState description={leadAnalyticsError} onRetry={loadLeadAnalytics} />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <GlassCard>
                <h3 className="mb-4 card-title">Most viewed services</h3>
                {leadAnalytics.mostViewedServices.length === 0 ? (
                  <EmptyState title="No service views tracked yet" />
                ) : (
                  <CategoryBarChart data={leadAnalytics.mostViewedServices} labelKey="service" valueKey="count" valueLabel="Views" />
                )}
              </GlassCard>

              <GlassCard>
                <h3 className="mb-4 card-title">Popular industries</h3>
                {leadAnalytics.popularIndustries.length === 0 ? (
                  <EmptyState title="No industry data yet" description="Populates as leads share their industry." />
                ) : (
                  <ul className="flex flex-col gap-2">
                    {leadAnalytics.popularIndustries.map((i) => (
                      <li key={i.industry} className="flex items-center justify-between border-b border-line/60 py-2 text-sm last:border-0">
                        <span className="text-ink-2">{i.industry}</span>
                        <span className="font-medium text-ink">{i.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </GlassCard>
            </div>
          )}

          {!overviewError && (
            <GlassCard>
              <h3 className="mb-4 card-title">Leads by decision stage</h3>
              {overview.leadsByStage.length === 0 ? (
                <EmptyState title="No visitors tracked yet" />
              ) : (
                <ul className="flex flex-col gap-2">
                  {overview.leadsByStage.map((s) => (
                    <li key={s.stage} className="flex items-center justify-between border-b border-line/60 py-2 text-sm last:border-0">
                      <span className="text-ink-2">{s.stage}</span>
                      <span className="font-medium text-ink">{s.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
