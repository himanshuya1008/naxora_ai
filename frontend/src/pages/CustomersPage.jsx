import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Building2, Search } from 'lucide-react';
import { listLeads } from '../services/leadService.js';
import { getErrorMessage } from '../utils/errors.js';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Badge from '../components/common/Badge.jsx';
import StatTile from '../components/common/StatTile.jsx';
import Table from '../components/common/Table.jsx';
import { CATEGORICAL } from '../utils/vizTokens.js';

// "Customers" = leads with status CUSTOMER — there's no separate Customer
// entity in the schema (see Lead.revenueOpportunity/currentPlan/ownerUserId
// on the model itself). Reuses the existing, already-authenticated
// GET /leads?status=CUSTOMER filter.
function CustomersSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} className="flex flex-col gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </GlassCard>
        ))}
      </div>
      <GlassCard>
        <Skeleton className="mb-4 h-4 w-24" />
        <div className="flex flex-col divide-y divide-line/60">
          {Array.from({ length: 5 }).map((_, i) => (
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
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = useCallback(() => {
    setError(null);
    listLeads({ pageSize: 100, status: 'CUSTOMER' })
      .then((res) => setCustomers(res.leads))
      .catch((err) => setError(getErrorMessage(err, 'Failed to load customers.')));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!customers) return [];
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((c) => `${c.name ?? ''} ${c.company ?? ''} ${c.email ?? ''}`.toLowerCase().includes(query));
  }, [customers, search]);

  if (error) {
    return <ErrorState description={error} onRetry={load} />;
  }

  if (!customers) {
    return <CustomersSkeleton />;
  }

  const industries = new Set(customers.map((c) => c.industry).filter(Boolean));
  const withCompany = customers.filter((c) => c.company).length;

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (c) => (
        <div>
          <p className="text-sm font-medium text-ink">{c.name ?? c.company ?? 'Unnamed customer'}</p>
          <p className="text-xs text-ink-faint">{c.company ?? c.email ?? '—'}</p>
        </div>
      ),
    },
    { key: 'industry', label: 'Industry', render: (c) => <span className="text-ink-2">{c.industry ?? '—'}</span> },
    {
      key: 'interestedService',
      label: 'Service',
      render: (c) => (c.interestedService ? <Badge tone="good">{c.interestedService}</Badge> : <span className="text-ink-faint">—</span>),
    },
    {
      key: 'createdAt',
      label: 'Converted',
      align: 'right',
      render: (c) => <span className="text-ink-faint">{format(new Date(c.createdAt), 'MMM d, yyyy')}</span>,
    },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Total customers" value={customers.length} icon={Building2} color={CATEGORICAL[2]} />
          <StatTile label="Companies represented" value={withCompany} icon={Building2} color={CATEGORICAL[0]} />
          <StatTile label="Industries" value={industries.size} icon={Building2} color={CATEGORICAL[4]} />
        </div>

        <GlassCard>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="card-title">Customers</h2>
            {customers.length > 0 && (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, company, email…"
                  aria-label="Search customers"
                  className="input-field w-full py-2 pl-8 text-xs sm:w-56"
                />
              </div>
            )}
          </div>

          {customers.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No customers yet"
              description="Leads appear here automatically once their status is marked Customer from the Leads page."
            />
          ) : filtered.length === 0 ? (
            <EmptyState title="No customers match your search" description="Try a different name, company, or email." />
          ) : (
            <Table columns={columns} rows={filtered} onRowClick={(c) => c.visitor?.id && navigate(`/app/visitors/${c.visitor.id}`)} />
          )}
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
