import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar.jsx';
import Footer from '../components/Footer/Footer.jsx';
import { BehaviorTrackingProvider } from '../hooks/BehaviorTrackingProvider.jsx';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import './MarketingLayout.css';

// No AnimatePresence-driven route transition here (deliberately removed —
// see git history for the previous fade+slide version). framer-motion v11's
// AnimatePresence exit tracking has known edge cases under React 19's
// StrictMode double-render in dev (never reproduces in a production build,
// since StrictMode's double-invoke behavior is dev-only) — the failure mode
// is a stuck exit transition where the outgoing page never finishes
// unmounting, leaving a faint, slightly offset "ghost" of the previous
// page's text rendered underneath the new one. Every individual section on
// each page still has its own scroll-in animation (see animations/variants.js
// fadeInUp/staggerContainer, used directly on mount — not route-keyed), so
// removing this one wrapper doesn't make the site feel static, it just
// removes the one animation actually capable of getting stuck.
export default function MarketingLayout() {
  const location = useLocation();

  return (
    <BehaviorTrackingProvider>
      <div className="marketing-layout">
        <Navbar />
        <main className="marketing-layout__main">
          <ErrorBoundary resetKey={location.pathname} homeHref="/">
            <Outlet />
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </BehaviorTrackingProvider>
  );
}
