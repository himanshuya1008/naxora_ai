import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Flame, Target, ShieldCheck, Activity, TrendingUp } from 'lucide-react';
import { getDnaDashboard } from '../services/customerDnaService.js';
import { getErrorMessage } from '../utils/errors.js';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatTile from '../components/common/StatTile.jsx';
import CircularScore from '../components/common/CircularScore.jsx';
import CategoryBarChart from '../components/analytics/CategoryBarChart.jsx';
import { CATEGORICAL } from '../utils/vizTokens.js';

const GRADE_ORDER = ['A_PLUS', 'A', 'B_PLUS', 'B', 'C', 'D'];
const GRADE_LABEL = { A_PLUS: 'A+', A: 'A', B_PLUS: 'B+', B: 'B', C: 'C', D: 'D' };
function DnaSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} className="flex flex-col gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </GlassCard>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard>
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="h-[220px] w-full" />
        </GlassCard>
        <GlassCard>
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="h-[220px] w-full" />
        </GlassCard>
      </div>
    </div>
  );
}

export default function CustomerDnaPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    getDnaDashboard()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load Customer DNA data.')));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return <ErrorState description={error} onRetry={load} />;
  }

  if (!data) {
    return <DnaSkeleton />;
  }

  if (data.totalCustomers === 0) {
    return (
      <EmptyState
        icon={Fingerprint}
        title="No Customer DNA profiles yet"
        description="Profiles build automatically from behavior data and conversation transcripts as visitors engage with the AI Sales Consultant."
      />
    );
  }

  const gradeData = GRADE_ORDER.filter((g) => data.gradeDistribution[g] > 0).map((g) => ({
    grade: GRADE_LABEL[g],
    count: data.gradeDistribution[g],
  }));

  return (
    <AnimatePresence mode="wait">
      <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Profiles built" value={data.totalCustomers} icon={Fingerprint} color={CATEGORICAL[0]} />
          <StatTile label="Hot leads (A grade)" value={data.hotLeads} icon={Flame} color={CATEGORICAL[7]} />
          <StatTile label="Avg. buying probability" value={`${data.averageScores.buyingProbability}%`} icon={Target} color={CATEGORICAL[2]} />
          <StatTile label="Avg. trust score" value={`${data.averageScores.trustScore}%`} icon={ShieldCheck} color={CATEGORICAL[4]} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr]">
          <GlassCard className="flex flex-col items-center justify-center gap-4">
            <h3 className="self-start card-title">Average scores</h3>
            <div className="flex flex-wrap items-center justify-center gap-6 py-2">
              <CircularScore value={data.averageScores.interestScore} label="Interest" size={92} icon={TrendingUp} />
              <CircularScore value={data.averageScores.trustScore} label="Trust" size={92} icon={ShieldCheck} />
              <CircularScore value={data.averageScores.engagementScore} label="Engagement" size={92} icon={Activity} />
              <CircularScore value={data.averageScores.buyingProbability} label="Buying probability" size={92} icon={Target} />
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="mb-1 card-title">Lead grade distribution</h3>
            <p className="mb-4 card-subtitle">Every customer&apos;s most recent DNA profile, graded A+ to D</p>
            {gradeData.length === 0 ? (
              <EmptyState title="No graded profiles yet" />
            ) : (
              <CategoryBarChart data={gradeData} labelKey="grade" valueKey="count" valueLabel="Customers" />
            )}
          </GlassCard>
        </div>

        <GlassCard>
          <h3 className="mb-1 card-title">Top pain points</h3>
          <p className="mb-4 card-subtitle">Most common pain points surfaced across every Customer DNA profile</p>
          {data.topPainPoints.length === 0 ? (
            <EmptyState title="No pain points captured yet" description="These populate as conversations surface specific customer challenges." />
          ) : (
            <ul className="flex flex-col divide-y divide-line/60">
              {data.topPainPoints.map((p) => (
                <li key={p.point} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-ink-2">{p.point}</span>
                  <span className="font-medium text-ink">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
