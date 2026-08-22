import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Mic,
  BarChart3,
  FileText,
  Settings,
  UserPlus,
  Fingerprint,
  Filter,
  Building2,
  LineChart,
  KeyRound,
  Sliders,
} from 'lucide-react';
import Logo from '../common/Logo.jsx';

// Grouped so the sidebar reads as sections of an enterprise CRM rather than
// one flat list — matches how Analytics/Reports/Leads naturally cluster
// versus org-level configuration at the bottom.
const NAV_GROUPS = [
  {
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/app/conversation', label: 'Conversations', icon: Mic },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      { to: '/app/leads', label: 'Leads', icon: UserPlus },
      { to: '/app/customers', label: 'Customers', icon: Building2 },
      { to: '/app/sales-funnel', label: 'Sales Funnel', icon: Filter },
      { to: '/app/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/app/customer-dna', label: 'Customer DNA', icon: Fingerprint },
      { to: '/app/revenue', label: 'Revenue Analytics', icon: LineChart },
    ],
  },
  {
    label: 'Organization',
    items: [
      { to: '/app/settings', label: 'Settings', icon: Settings },
      { to: '/app/api-keys', label: 'API Keys', icon: KeyRound },
      { to: '/app/voice-configuration', label: 'Voice Configuration', icon: Sliders },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface p-4 lg:flex">
      <div className="mb-6 px-2">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-5">
        {NAV_GROUPS.map((group, i) => (
          <div key={group.label ?? i} className="flex flex-col gap-1">
            {group.label && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{group.label}</p>
            )}
            {group.items.map(({ to, label, icon: Icon, end }) => (
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
          </div>
        ))}
      </nav>

      <div className="rounded-xl2 border border-line bg-bg-alt/60 p-3 text-xs text-ink-faint">
        Enterprise AI Sales Intelligence
      </div>
    </aside>
  );
}
