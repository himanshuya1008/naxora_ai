import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FileText, Mic, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { listReports } from '../services/reportService.js';
import { getErrorMessage } from '../utils/errors.js';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Table from '../components/common/Table.jsx';

const STAGE_TONE = { NEW: 'neutral', QUALIFIED: 'accent', DEMO_REQUESTED: 'accent', PROPOSAL: 'warning', NEGOTIATION: 'warning', CLOSED_WON: 'good', CLOSED_LOST: 'critical' };
const STAGE_OPTIONS = ['NEW', 'QUALIFIED', 'DEMO_REQUESTED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
const PAGE_SIZE = 5;

function ReportsSkeleton() {
  return (
    <GlassCard>
      <Skeleton className="mb-4 h-4 w-32" />
      <div className="flex flex-col divide-y divide-line/60">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3.5">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const load = useCallback(() => {
    setError(null);
    listReports()
      .then(setReports)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load reports.')));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!reports) return [];
    const query = search.trim().toLowerCase();
    return reports.filter((r) => {
      const name = r.conversation.visitor.name ?? '';
      const company = r.conversation.visitor.company ?? '';
      const matchesQuery = !query || name.toLowerCase().includes(query) || company.toLowerCase().includes(query);
      const matchesStage = !stageFilter || (r.crmSummary?.dealStage ?? 'NEW') === stageFilter;
      return matchesQuery && matchesStage;
    });
  }, [reports, search, stageFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const updateStageFilter = (value) => {
    setStageFilter(value);
    setPage(1);
  };

  if (error) {
    return <ErrorState description={error} onRetry={load} />;
  }

  const columns = [
    {
      key: 'visitor',
      label: 'Visitor',
      render: (report) => (
        <div>
          <p className="text-sm font-medium text-ink">
            {report.conversation.visitor.name ?? report.conversation.visitor.company ?? 'Anonymous visitor'}
          </p>
          <p className="text-xs text-ink-faint">{format(new Date(report.generatedAt), 'MMM d, yyyy HH:mm')}</p>
        </div>
      ),
    },
    {
      key: 'buyingProbability',
      label: 'Buying probability',
      render: (report) => <span className="text-ink-2">{report.buyingProbability}%</span>,
    },
    {
      key: 'dealStage',
      label: 'Deal stage',
      align: 'right',
      render: (report) => <Badge tone={STAGE_TONE[report.crmSummary?.dealStage] ?? 'neutral'}>{report.crmSummary?.dealStage ?? 'NEW'}</Badge>,
    },
  ];

  return (
    <AnimatePresence mode="wait">
      {!reports ? (
        <motion.div key="skeleton" exit={{ opacity: 0 }}>
          <ReportsSkeleton />
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
          <GlassCard>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="card-title">Sales reports</h2>

              {reports.length > 0 && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                    <input
                      value={search}
                      onChange={(e) => updateSearch(e.target.value)}
                      placeholder="Search visitor or company…"
                      aria-label="Search reports"
                      className="input-field w-full py-2 pl-8 text-xs sm:w-56"
                    />
                  </div>
                  <select
                    value={stageFilter}
                    onChange={(e) => updateStageFilter(e.target.value)}
                    aria-label="Filter by deal stage"
                    className="input-field w-full py-2 text-xs sm:w-44"
                  >
                    <option value="">All stages</option>
                    {STAGE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replaceAll('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {reports.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No reports yet"
                description="Reports are generated automatically when a conversation ends."
                action={
                  <Button variant="secondary" onClick={() => navigate('/app/conversation')}>
                    <Mic className="h-4 w-4" />
                    Start a conversation
                  </Button>
                }
              />
            ) : filtered.length === 0 ? (
              <EmptyState title="No reports match your search" description="Try a different name, company, or stage filter." />
            ) : (
              <>
                <Table columns={columns} rows={pageItems} onRowClick={(report) => navigate(`/app/reports/${report.conversationId}`)} />

                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
                    <p className="text-xs text-ink-faint">
                      Page {currentPage} of {totalPages} &middot; {filtered.length} report{filtered.length === 1 ? '' : 's'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                        className="rounded-md p-1.5 text-ink-faint hover:bg-champagne/15 hover:text-ink-2 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                        className="rounded-md p-1.5 text-ink-faint hover:bg-champagne/15 hover:text-ink-2 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
