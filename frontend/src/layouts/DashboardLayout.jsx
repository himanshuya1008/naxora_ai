import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar.jsx';
import Topbar from '../components/layout/Topbar.jsx';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import PageBackdrop from '../components/layout/PageBackdrop.jsx';

const TITLES = [
  { match: /^\/app\/conversation/, title: 'AI Conversation', subtitle: 'Live voice call with real-time signals', backdrop: 'conversation' },
  { match: /^\/app\/analytics/, title: 'Analytics', subtitle: 'Trends across visitors, conversations, and objections', backdrop: 'chart' },
  { match: /^\/app\/leads/, title: 'Leads', subtitle: 'Leads captured from the AI Consultant, Book Demo, and Contact forms', backdrop: 'network' },
  { match: /^\/app\/customers/, title: 'Customers', subtitle: 'Leads that have converted into paying customers', backdrop: 'network' },
  { match: /^\/app\/sales-funnel/, title: 'Sales Funnel', subtitle: 'Stage-by-stage conversion from visitor to qualified lead', backdrop: 'chart' },
  { match: /^\/app\/customer-dna/, title: 'Customer DNA', subtitle: 'Org-wide behavioral and personality intelligence', backdrop: 'orbit' },
  { match: /^\/app\/revenue/, title: 'Revenue Analytics', subtitle: 'Lead sources, deal-size signals, and plan/revenue tracking', backdrop: 'chart' },
  { match: /^\/app\/reports/, title: 'Reports', subtitle: 'Generated sales reports and CRM summaries', backdrop: 'stack' },
  { match: /^\/app\/api-keys/, title: 'API Keys', subtitle: 'Tracking API keys for the website snippet and public forms', backdrop: 'default' },
  { match: /^\/app\/voice-configuration/, title: 'Voice Configuration', subtitle: 'Default conversation language and voice provider', backdrop: 'default' },
  { match: /^\/app\/settings/, title: 'Settings', subtitle: 'Organization identity and team membership', backdrop: 'default' },
  { match: /^\/app\/profile/, title: 'Profile', subtitle: 'Your account, organization, and security', backdrop: 'default' },
  { match: /^\/app\/visitors/, title: 'Visitor Detail', subtitle: 'Behavior, DNA, and conversation history', backdrop: 'network' },
  { match: /^\/app$/, title: 'Dashboard', subtitle: 'Overview of tracked visitors and conversations', backdrop: 'heroFigure' },
];

function usePageMeta() {
  const { pathname } = useLocation();
  return TITLES.find((t) => t.match.test(pathname)) ?? TITLES[TITLES.length - 1];
}

export default function DashboardLayout() {
  const { title, subtitle, backdrop } = usePageMeta();
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} />
        <main className="relative flex-1 overflow-y-auto p-6">
          {/* Decorative only (pointer-events-none, behind content via -z-10)
              — a per-section background so each part of the dashboard has
              its own visual identity within the same bronze/cream system,
              instead of one flat fill reused everywhere. Doesn't affect
              layout, scroll, or any element's position. */}
          <PageBackdrop variant={backdrop} />

          <ErrorBoundary resetKey={pathname} homeHref="/app">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
