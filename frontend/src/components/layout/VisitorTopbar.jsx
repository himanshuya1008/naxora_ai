import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, User } from 'lucide-react';
import { useVisitorAuthStore } from '../../store/visitorAuthStore.js';
import Dropdown from '../common/Dropdown.jsx';

export default function VisitorTopbar({ title, subtitle }) {
  const { visitor, logout } = useVisitorAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/visitor/login', { replace: true });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-surface/80 px-6 backdrop-blur-md">
      <div>
        <h1 className="font-serif text-lg font-medium tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-ink-faint">{subtitle}</p>}
      </div>

      <Dropdown
        trigger={({ toggle, triggerRef }) => (
          <button
            ref={triggerRef}
            onClick={toggle}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-2 hover:bg-champagne/15"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-bronze to-mocha text-xs font-semibold text-[#FFFFFF]">
              {visitor?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
            <span className="hidden sm:inline">{visitor?.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
          </button>
        )}
      >
        {({ close }) => (
          <>
            <div className="truncate px-3 py-2 text-xs text-ink-faint" title={visitor?.email}>
              {visitor?.email}
            </div>
            <button
              onClick={() => {
                close();
                navigate('/visitor/profile');
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-2 hover:bg-champagne/15"
            >
              <User className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => {
                close();
                handleLogout();
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-2 hover:bg-champagne/15"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </>
        )}
      </Dropdown>
    </header>
  );
}
