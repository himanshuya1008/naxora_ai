import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Mic, ArrowRight } from 'lucide-react';
import { listMyConversations } from '../../services/visitorPortalService.js';
import { getErrorMessage } from '../../utils/errors.js';
import Table from '../../components/common/Table.jsx';
import Badge from '../../components/common/Badge.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import GlassCard from '../../components/common/GlassCard.jsx';

const STATUS_TONE = { ACTIVE: 'accent', ENDED: 'good', ABANDONED: 'neutral' };

function formatDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function VisitorConversationsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await listMyConversations();
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
      <GlassCard className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </GlassCard>
    );
  }

  if (status === 'error') {
    return <ErrorState description={error} onRetry={load} />;
  }

  const columns = [
    {
      key: 'startedAt',
      label: 'Date',
      render: (row) => format(new Date(row.startedAt), 'MMM d, yyyy · h:mm a'),
    },
    { key: 'duration', label: 'Duration', render: (row) => formatDuration(row.durationSeconds) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={STATUS_TONE[row.status] ?? 'neutral'}>{row.status}</Badge>,
    },
    {
      key: 'summary',
      label: 'Summary',
      render: (row) => (
        <span className="line-clamp-1 max-w-xs text-ink-faint">{row.report?.transcriptSummary ?? 'Not yet summarized'}</span>
      ),
    },
    {
      key: 'action',
      label: '',
      align: 'right',
      render: (row) => (
        <Link to={`/visitor/conversations/${row.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-accent">
          View <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <GlassCard>
      <Table
        columns={columns}
        rows={data.conversations}
        onRowClick={(row) => navigate(`/visitor/conversations/${row.id}`)}
        emptyState={
          <EmptyState
            icon={Mic}
            title="No conversations yet"
            description="Once you talk with our AI Sales Consultant, every call shows up here."
            action={
              <Link to="/ai-consultant" className="btn-primary">
                Start a conversation
              </Link>
            }
          />
        }
      />
    </GlassCard>
  );
}
