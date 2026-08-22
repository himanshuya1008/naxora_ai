import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, TrendingUp, PiggyBank } from 'lucide-react';
import { getLeadAnalytics } from '../services/analyticsService.js';
import { listLeads } from '../services/leadService.js';
import { getErrorMessage } from '../utils/errors.js';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import CategoryBarChart from '../components/analytics/CategoryBarChart.jsx';

const SOURCE_LABEL = { AI_CONVERSATION: 'AI Consultant', BOOK_DEMO_FORM: 'Book Demo', CONTACT_FORM: 'Contact Form' };

function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <GlassCard>
        <Skeleton className="mb-4 h-4 w-32" />
        <Skeleton className="h-[220px] w-full" />
      </GlassCard>
      <GlassCard>
        <Skeleton className="mb-4 h-4 w-40" />
        <Skeleton className="h-[160px] w-full" />
      </GlassCard>
    </div>
  );
}

/**
 * "Plans & Revenue Analytics" per the product ask — but this schema has no
 * Plan/Subscription/Payment model at all (no pricing tier is ever recorded
 * against a lead or org), so "which plan is most popular," "revenue by
 * plan," and "daily/weekly/monthly sales" have no real number to show.
 * Rather than invent figures for a real business dashboard, this page shows
 * what IS real (lead sources, deal-size signals from self-reported budget)
 * and is explicit about what needs a billing/payments integration to light
 * up — an honest empty state, not a placeholder pretending to be data.
 */
export default function RevenueAnalyticsPage() {
  const [leadAnalytics, setLeadAnalytics] = useState(null);
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    Promise.all([getLeadAnalytics(), listLeads({ pageSize: 100 })])
      .then(([la, leadsRes]) => {
        setLeadAnalytics(la);
        setLeads(leadsRes.leads);
      })
      .catch((err) => setError(getErrorMessage(err, 'Failed to load revenue analytics.')));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sourceBreakdown = useMemo(() => {
    if (!leads) return [];
    const counts = leads.reduce((acc, lead) => {
      const label = SOURCE_LABEL[lead.source] ?? lead.source;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  if (error) {
    return <ErrorState description={error} onRetry={load} />;
  }

  if (!leadAnalytics || !leads) {
    return <Loading />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GlassCard>
            <h2 className="mb-1 card-title">Lead sources</h2>
            <p className="mb-4 card-subtitle">Where converted and in-progress leads originate from</p>
            {sourceBreakdown.length === 0 ? (
              <EmptyState title="No leads yet" />
            ) : (
              <CategoryBarChart data={sourceBreakdown} labelKey="source" valueKey="count" valueLabel="Leads" />
            )}
          </GlassCard>

          <GlassCard>
            <h2 className="mb-1 card-title">Self-reported budget range</h2>
            <p className="mb-4 card-subtitle">Deal-size signal volunteered during sales conversations</p>
            {leadAnalytics.budgetDistribution.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No budget data yet"
                description="Populates as the AI Sales Consultant captures a budget range during conversations."
              />
            ) : (
              <CategoryBarChart data={leadAnalytics.budgetDistribution} labelKey="budget" valueKey="count" valueLabel="Leads" />
            )}
          </GlassCard>
        </div>

        <GlassCard className="border-dashed">
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-bronze/10 text-bronze">
              <CreditCard className="h-6 w-6" />
            </span>
            <div className="max-w-md">
              <p className="text-sm font-medium text-ink-2">Revenue and plan analytics aren&apos;t connected yet</p>
              <p className="mt-1.5 text-sm text-ink-faint">
                This platform doesn&apos;t currently track pricing plans, subscriptions, or payments per lead — so figures like{' '}
                <span className="text-ink-faint">revenue by plan</span>, <span className="text-ink-faint">most popular plan</span>, and{' '}
                <span className="text-ink-faint">daily / weekly / monthly sales</span> have no real data to show. Connecting a billing
                provider (e.g. Stripe) and recording which plan each customer is on would light this section up with real numbers instead
                of a placeholder.
              </p>
            </div>
            <div className="mt-2 grid w-full max-w-md grid-cols-3 gap-3 text-left">
              {[
                { icon: TrendingUp, label: 'Revenue generated' },
                { icon: PiggyBank, label: 'Most popular plan' },
                { icon: CreditCard, label: 'Sales by day/week/month' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 rounded-lg border border-line bg-bg-alt/40 px-3 py-4 text-center">
                  <Icon className="h-4 w-4 text-ink-faint" />
                  <span className="text-[11px] text-ink-faint">{label}</span>
                  <span className="text-xs font-medium text-ink-faint">Not connected</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
