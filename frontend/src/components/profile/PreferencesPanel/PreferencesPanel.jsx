import { Moon, Sun, Monitor, Bell, Globe } from 'lucide-react';
import ProfileSection from '../ProfileSection/ProfileSection.jsx';
import ComingSoonBadge from '../ComingSoonBadge/ComingSoonBadge.jsx';
import './PreferencesPanel.css';

const THEMES = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'system', label: 'System', icon: Monitor },
];

export default function PreferencesPanel() {
  return (
    <ProfileSection title="Preferences" description="Personalize how the dashboard looks and notifies you." delay={0.2}>
      <div className="preferences-panel__group">
        <div className="preferences-panel__group-header">
          <p className="preferences-panel__group-label">Theme</p>
          <ComingSoonBadge />
        </div>
        <div className="preferences-panel__theme-options">
          {THEMES.map((theme) => (
            <button key={theme.id} className={`preferences-panel__theme-btn ${theme.id === 'dark' ? 'preferences-panel__theme-btn--active' : ''}`} disabled={theme.id !== 'dark'}>
              <theme.icon size={16} />
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <div className="preferences-panel__group">
        <div className="preferences-panel__group-header">
          <div className="preferences-panel__group-title">
            <Bell size={15} />
            <p className="preferences-panel__group-label">Notifications</p>
          </div>
          <ComingSoonBadge />
        </div>
        <p className="preferences-panel__group-description">Email and in-app alerts for new leads and conversations.</p>
      </div>

      <div className="preferences-panel__group">
        <div className="preferences-panel__group-header">
          <div className="preferences-panel__group-title">
            <Globe size={15} />
            <p className="preferences-panel__group-label">Language</p>
          </div>
          <ComingSoonBadge />
        </div>
        <select className="preferences-panel__select" disabled defaultValue="en">
          <option value="en">English</option>
        </select>
      </div>
    </ProfileSection>
  );
}
