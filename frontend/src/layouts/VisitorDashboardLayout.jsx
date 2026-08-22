import { Outlet, useLocation } from 'react-router-dom';
import VisitorSidebar from '../components/layout/VisitorSidebar.jsx';
import VisitorTopbar from '../components/layout/VisitorTopbar.jsx';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import PageBackdrop from '../components/layout/PageBackdrop.jsx';

const TITLES = [
  { match: /^\/visitor\/conversations\/.+/, title: 'Conversation', subtitle: 'Transcript and summary', backdrop: 'conversation' },
  { match: /^\/visitor\/conversations/, title: 'My Conversations', subtitle: 'Every voice call you’ve had with our AI', backdrop: 'conversation' },
  { match: /^\/visitor\/requests/, title: 'My Requests', subtitle: 'Demos and service interest you’ve submitted', backdrop: 'network' },
  { match: /^\/visitor\/profile/, title: 'My Profile', subtitle: 'Your account details', backdrop: 'default' },
  { match: /^\/visitor\/settings/, title: 'Settings', subtitle: 'Password and account security', backdrop: 'default' },
  { match: /^\/visitor$/, title: 'Dashboard', subtitle: 'Your activity at a glance', backdrop: 'default' },
];

function usePageMeta() {
  const { pathname } = useLocation();
  return TITLES.find((t) => t.match.test(pathname)) ?? TITLES[TITLES.length - 1];
}

// Visitor-side equivalent of layouts/DashboardLayout.jsx.
export default function VisitorDashboardLayout() {
  const { title, subtitle, backdrop } = usePageMeta();
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-bg">
      <VisitorSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <VisitorTopbar title={title} subtitle={subtitle} />
        <main className="relative flex-1 overflow-y-auto p-6">
          <PageBackdrop variant={backdrop} />

          <ErrorBoundary resetKey={pathname} homeHref="/visitor">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
