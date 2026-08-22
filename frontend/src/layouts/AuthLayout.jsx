import { Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, Sparkles, BarChart3 } from 'lucide-react';
import PremiumMark from '../components/common/PremiumMark.jsx';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import LiveAiOrb from '../components/illustrations/LiveAiOrb.jsx';
import './AuthLayout.css';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Enterprise-grade security',
    desc: 'Short-lived access tokens and httpOnly refresh cookies protect every session.',
  },
  {
    icon: Sparkles,
    title: 'AI-powered intelligence',
    desc: 'Real-time voice conversations and behavioral Customer DNA on every visitor.',
  },
  {
    icon: BarChart3,
    title: 'Built for enterprise scale',
    desc: 'One platform for conversations, leads, analytics, and reporting.',
  },
];

// The role-selection screen (/login, no ?role= yet) is a deliberately
// bare, centered layout — no marketing panel — while every other auth
// screen (the credential form after picking Admin, and /register) keeps
// the full two-column brand-panel treatment. Same route tree, same
// AuthLayout, purely a presentational branch off existing location state.
export default function AuthLayout() {
  const { pathname, search } = useLocation();
  const isRoleChooser = pathname === '/login' && !new URLSearchParams(search).get('role');

  return (
    <div className={`auth-premium ${isRoleChooser ? 'auth-premium--centered' : ''}`}>
      <div className="auth-premium__scene" aria-hidden="true">
        <div className="auth-premium__grain" />
      </div>

      {!isRoleChooser && (
        <aside className="auth-premium__brand-panel">
          <div className="auth-premium__figure" aria-hidden="true">
            <span className="auth-premium__figure-ring" />
            <LiveAiOrb size={230} fallbackTone="dark" />
          </div>

          <div className="auth-premium__brand-content">
            <PremiumMark size={36} />
            <span className="auth-premium__eyebrow" style={{ marginTop: '2.5rem' }}>
              Nexora AI Platform
            </span>
            <h1 className="auth-premium__headline">
              AI sales intelligence,
              <br />
              <em>redefined.</em>
            </h1>
            <p className="auth-premium__subtext">
              One platform to run every AI-powered sales conversation, understand every visitor, and manage your
              whole pipeline.
            </p>

            <div className="auth-premium__features">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div className="auth-premium__feature" key={title}>
                  <span className="auth-premium__feature-icon">
                    <Icon className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="auth-premium__feature-title">{title}</p>
                    <p className="auth-premium__feature-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="auth-premium__footline">Nexora AI — enterprise sales intelligence, built for scale.</p>
        </aside>
      )}

      <div className="auth-premium__content">
        <div className="auth-premium__content-inner">
          <div className="auth-premium__mobile-mark">
            <PremiumMark size={34} />
          </div>

          <ErrorBoundary resetKey={pathname} homeHref="/">
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
