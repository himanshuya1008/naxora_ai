import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { UserPlus } from 'lucide-react';
import { listMyLeads } from '../../services/visitorPortalService.js';
import { getErrorMessage } from '../../utils/errors.js';
import Table from '../../components/common/Table.jsx';
import Badge from '../../components/common/Badge.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import GlassCard from '../../components/common/GlassCard.jsx';

const STATUS_TONE = { NEW: 'accent', CONTACTED: 'neutral', QUALIFIED: 'good', CONVERTED: 'good', LOST: 'critical' };
const SOURCE_LABEL = { AI_CONVERSATION: 'AI Consultant', BOOK_DEMO_FORM: 'Demo request', CONTACT_FORM: 'Contact form' };

export default function VisitorRequestsPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await listMyLeads();
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
    { key: 'createdAt', label: 'Submitted', render: (row) => format(new Date(row.createdAt), 'MMM d, yyyy') },
    { key: 'interestedService', label: 'Interested Service', render: (row) => row.interestedService ?? '—' },
    { key: 'source', label: 'Source', render: (row) => SOURCE_LABEL[row.source] ?? row.source },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={STATUS_TONE[row.status] ?? 'neutral'}>{row.status}</Badge>,
    },
  ];

  return (
    <GlassCard>
      <Table
        columns={columns}
        rows={data.leads}
        emptyState={
          <EmptyState
            icon={UserPlus}
            title="No requests yet"
            description="Demo requests and service interest you submit — whether through a form or while talking to our AI — show up here."
          />
        }
      />
    </GlassCard>
  );
}
