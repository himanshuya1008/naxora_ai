import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import PageLoader from '../components/common/PageLoader.jsx';
import { isDemoMode } from '../utils/demoMode.js';

export default function ProtectedRoute() {
  const { status } = useAuthStore();
  const location = useLocation();

  // DEV DEMO MODE — see utils/demoMode.js. Bypasses the auth gate entirely
  // so /app/* is reachable without logging in. To remove: delete this block
  // and the isDemoMode import/usage here (the demoMode.js file also backs
  // the service-layer mock-data fallback, so don't delete that file unless
  // removing both features).
  if (isDemoMode) {
    return <Outlet />;
  }

  if (status === 'idle' || status === 'loading') {
    return <PageLoader />;
  }

  if (status !== 'authenticated') {
    // ?role=admin skips straight past the role-picker cards (LoginPage.jsx)
    // to the credentials form — someone bounced off a /app/* route was
    // already trying to reach the admin dashboard, so there's no reason to
    // make them pick a role they've already implicitly chosen.
    return <Navigate to="/login?role=admin" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
