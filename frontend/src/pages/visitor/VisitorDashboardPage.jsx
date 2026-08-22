import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Mic, UserPlus, Clock, ArrowRight } from 'lucide-react';
import { getMyOverview } from '../../services/visitorPortalService.js';
import { getErrorMessage } from '../../utils/errors.js';
import { useVisitorAuthStore } from '../../store/visitorAuthStore.js';
import StatTile from '../../components/common/StatTile.jsx';
import GlassCard from '../../components/common/GlassCard.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import LiveAiOrb from '../../components/illustrations/LiveAiOrb.jsx';

// Phase 2 replacement for the Phase 1 placeholder — this visitor's own
// overview, not a scaled-down copy of the admin DashboardPage (that one
// aggregates across the whole organization; this is one account's numbers).
export default function VisitorDashboardPage() {
  const { visitor } = useVisitorAuthStore();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await getMyOverview();
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} className="flex flex-col gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </GlassCard>
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return <ErrorState description={error} onRetry={load} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative flex items-center justify-between gap-4 overflow-hidden">
        <div>
          <h2 className="font-serif text-2xl font-medium text-ink">Welcome back, {visitor?.name?.split(' ')[0]}</h2>
          <p className="mt-1 text-sm text-ink-faint">Here&apos;s a quick look at your activity with Nexora AI.</p>
        </div>
        <div className="hidden shrink-0 opacity-90 md:block">
          <LiveAiOrb size={104} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Voice Conversations" value={data.conversationCount} icon={Mic} />
        <StatTile label="Requests Submitted" value={data.leadCount} icon={UserPlus} />
        <GlassCard className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-faint">Last Conversation</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bronze/10 text-bronze">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <span className="font-serif text-lg font-medium text-ink">
            {data.lastConversation ? formatDistanceToNow(new Date(data.lastConversation.startedAt), { addSuffix: true }) : 'Never'}
          </span>
        </GlassCard>
      </div>

      <GlassCard className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-base font-medium text-ink">Talk to our AI Sales Consultant</p>
          <p className="mt-1 text-sm text-ink-faint">Every conversation is saved to your history automatically.</p>
        </div>
        <Link to="/ai-consultant" className="btn-primary shrink-0">
          Start a conversation
          <ArrowRight className="h-4 w-4" />
        </Link>
      </GlassCard>
    </div>
  );
}
