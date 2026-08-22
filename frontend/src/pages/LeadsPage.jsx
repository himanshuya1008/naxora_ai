import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { UserPlus, Search } from 'lucide-react';
import { listLeads } from '../services/leadService.js';
import { getErrorMessage } from '../utils/errors.js';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Badge from '../components/common/Badge.jsx';
import Table from '../components/common/Table.jsx';

const STATUS_TONE = {
  NEW_LEAD: 'neutral',
  CONTACTED: 'accent',
  QUALIFIED: 'good',
  DEMO_REQUESTED: 'accent',
  PROPOSAL_SENT: 'accent',
  CUSTOMER: 'good',
  WON: 'good',
  LOST: 'critical',
};
const STATUS_OPTIONS = ['NEW_LEAD', 'CONTACTED', 'QUALIFIED', 'DEMO_REQUESTED', 'PROPOSAL_SENT', 'CUSTOMER', 'WON', 'LOST'];
const STATUS_LABEL = {
  NEW_LEAD: 'New Lead',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  DEMO_REQUESTED: 'Demo Requested',
  PROPOSAL_SENT: 'Proposal Sent',
  CUSTOMER: 'Customer',
  WON: 'Won',
  LOST: 'Lost',
};
const SOURCE_LABEL = {
  AI_CONVERSATION: 'AI Consultant',
  BOOK_DEMO_FORM: 'Book Demo',
  CONTACT_FORM: 'Contact Form',
  VOICE_CALL: 'Voice Call',
};

function LeadsSkeleton() {
  return (
    <GlassCard>
      <Skeleton className="mb-4 h-4 w-24" />
      <div className="flex flex-col divide-y divide-line/60">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3.5">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const load = useCallback(() => {
    setError(null);
    listLeads({ pageSize: 100 })
      .then((res) => setLeads(res.leads))
      .catch((err) => setError(getErrorMessage(err, 'Failed to load leads.')));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!leads) return [];
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const haystack = `${lead.name ?? ''} ${lead.company ?? ''} ${lead.email ?? ''}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesStatus = !statusFilter || lead.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  if (error) {
    return <ErrorState description={error} onRetry={load} />;
  }

  const columns = [
    {
      key: 'name',
      label: 'Lead',
      render: (lead) => (
        <div>
          <p className="text-sm font-medium text-ink">{lead.name ?? lead.company ?? 'Unnamed lead'}</p>
          <p className="text-xs text-ink-faint">{lead.company ?? lead.email ?? '—'}</p>
        </div>
      ),
    },
    { key: 'source', label: 'Source', render: (lead) => <span className="text-ink-2">{SOURCE_LABEL[lead.source] ?? lead.source}</span> },
    {
      key: 'interestedService',
      label: 'Interest',
      render: (lead) => <span className="text-ink-faint">{lead.interestedService ?? '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (lead) => <Badge tone={STATUS_TONE[lead.status] ?? 'neutral'}>{STATUS_LABEL[lead.status] ?? lead.status}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      align: 'right',
      render: (lead) => <span className="text-ink-faint">{format(new Date(lead.createdAt), 'MMM d, yyyy')}</span>,
    },
  ];

  return (
    <AnimatePresence mode="wait">
      {!leads ? (
        <motion.div key="skeleton" exit={{ opacity: 0 }}>
          <LeadsSkeleton />
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
          <GlassCard>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="card-title">Leads</h2>

              {leads.length > 0 && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search name, company, email…"
                      aria-label="Search leads"
                      className="input-field w-full py-2 pl-8 text-xs sm:w-56"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                    className="input-field w-full py-2 text-xs sm:w-40"
                  >
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {leads.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No leads yet"
                description="Leads are created automatically from the AI Sales Consultant, Book Demo, and Contact forms on the marketing site."
              />
            ) : filtered.length === 0 ? (
              <EmptyState title="No leads match your search" description="Try a different name, company, or status filter." />
            ) : (
              <Table columns={columns} rows={filtered} onRowClick={(lead) => lead.visitor?.id && navigate(`/app/visitors/${lead.visitor.id}`)} />
            )}
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
