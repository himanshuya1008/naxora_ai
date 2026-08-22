import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useVisitorAuthStore } from '../store/visitorAuthStore.js';
import PageLoader from '../components/common/PageLoader.jsx';

// Visitor-side equivalent of ProtectedRoute.jsx — separate component (not a
// shared parameterized one) so the two guard behaviors can diverge freely as
// each side grows, matching the "completely separate flows" requirement.
export default function ProtectedVisitorRoute() {
  const { status } = useVisitorAuthStore();
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return <PageLoader />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/visitor/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
