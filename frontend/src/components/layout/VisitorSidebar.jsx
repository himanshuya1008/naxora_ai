import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, Mic, UserPlus, User, Settings } from 'lucide-react';
import Logo from '../common/Logo.jsx';

// Visitor-side equivalent of components/layout/Sidebar.jsx — a separate
// component (not the admin one made conditional) since the two nav trees,
// routes, and auth stores are intentionally unrelated.
const NAV_ITEMS = [
  { to: '/visitor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/visitor/conversations', label: 'My Conversations', icon: Mic },
  { to: '/visitor/requests', label: 'My Requests', icon: UserPlus },
  { to: '/visitor/profile', label: 'My Profile', icon: User },
  { to: '/visitor/settings', label: 'Settings', icon: Settings },
];

export default function VisitorSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface p-4 lg:flex">
      <div className="mb-6 px-2">
        <Logo to="/visitor" />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'border-bronze bg-champagne/25 text-coffee'
                  : 'border-transparent text-ink-faint hover:bg-champagne/10 hover:text-ink-2'
              )
            }
          >
            <Icon className="icon-interactive h-4 w-4 shrink-0" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-xl2 border border-line bg-bg-alt/60 p-3 text-xs text-ink-faint">Your Nexora AI account</div>
    </aside>
  );
}
