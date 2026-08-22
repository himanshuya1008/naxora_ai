import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { Mic, ArrowLeft, Clock, MousePointerClick, TrendingUp } from 'lucide-react';
import { getVisitor } from '../services/visitorService.js';
import { getErrorMessage } from '../utils/errors.js';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import DnaPanel from '../components/dna/DnaPanel.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <GlassCard className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      </GlassCard>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <GlassCard>
            <Skeleton className="mb-4 h-4 w-32" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-10" />
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <Skeleton className="mb-4 h-4 w-32" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </GlassCard>
        </div>
        <GlassCard className="h-fit">
          <Skeleton className="mb-4 h-4 w-28" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function VisitorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setData(null);
    setError(null);
    getVisitor(id)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load this visitor.')));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return <ErrorState description={error} onRetry={load} />;
  }

  return (
    <AnimatePresence mode="wait">
      {!data ? (
        <motion.div key="skeleton" exit={{ opacity: 0 }}>
          <DetailSkeleton />
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
          <VisitorDetailContent data={data} navigate={navigate} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VisitorDetailContent({ data, navigate }) {
  const { visitor, behaviorSummary, customerDNA, conversations } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <Button onClick={() => navigate(`/app/conversation/${visitor.id}`)}>
          <Mic className="h-4 w-4" />
          Start voice conversation
        </Button>
      </div>

      <GlassCard className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-medium text-ink">{visitor.name ?? 'Anonymous visitor'}</h2>
          <p className="text-sm text-ink-faint">{visitor.company ?? visitor.email ?? 'No identity captured yet'}</p>
        </div>
        <div className="text-right text-xs text-ink-faint">
          <p>First seen {formatDistanceToNow(new Date(visitor.firstSeenAt), { addSuffix: true })}</p>
          <p>Last active {formatDistanceToNow(new Date(visitor.lastSeenAt), { addSuffix: true })}</p>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <GlassCard>
            <h3 className="mb-4 card-title">Behavior summary</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat icon={TrendingUp} label="Interest score" value={behaviorSummary.interestScore} />
              <Stat icon={MousePointerClick} label="Sessions" value={behaviorSummary.sessionCount} />
              <Stat icon={Clock} label="Pricing dwell" value={`${behaviorSummary.pricingDwellSeconds}s`} />
              <Stat icon={TrendingUp} label="Scroll depth" value={`${behaviorSummary.scrollDepthAvg}%`} />
            </div>
            {behaviorSummary.painPointSignals.length > 0 && (
              <div className="mt-4">
                <p className="mb-1.5 text-xs text-ink-faint">Possible pain points</p>
                <div className="flex flex-wrap gap-1.5">
                  {behaviorSummary.painPointSignals.map((p) => (
                    <Badge key={p}>{p}</Badge>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="mb-4 card-title">Recent journey</h3>
            {behaviorSummary.journey.length === 0 ? (
              <EmptyState title="No activity recorded yet" />
            ) : (
              <ol className="flex flex-col gap-3">
                {behaviorSummary.journey
                  .slice(-12)
                  .reverse()
                  .map((event, i) => (
                    <li key={i} className="flex items-center justify-between border-b border-line/60 pb-3 text-sm last:border-0 last:pb-0">
                      <div>
                        <span className="font-medium text-ink-2">{event.type.replaceAll('_', ' ')}</span>
                        <span className="ml-2 text-xs text-ink-faint">{event.page}</span>
                      </div>
                      <span className="text-xs text-ink-faint">{format(new Date(event.occurredAt), 'MMM d, HH:mm')}</span>
                    </li>
                  ))}
              </ol>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="mb-4 card-title">Past conversations</h3>
            {conversations.length === 0 ? (
              <EmptyState
                title="No conversations yet"
                description="Start a voice call with this visitor to build a transcript and report."
                action={
                  <Button variant="secondary" onClick={() => navigate(`/app/conversation/${visitor.id}`)}>
                    <Mic className="h-4 w-4" />
                    Start a conversation
                  </Button>
                }
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => navigate(`/app/reports/${c.id}`)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-champagne/10"
                    >
                      <span className="text-ink-2">{format(new Date(c.startedAt), 'MMM d, yyyy HH:mm')}</span>
                      <Badge tone={c.status === 'ACTIVE' ? 'good' : 'neutral'}>{c.status}</Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>

        <GlassCard className="h-fit">
          <h3 className="mb-4 card-title">Customer DNA</h3>
          <DnaPanel dna={customerDNA} />
        </GlassCard>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-ink-faint">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
