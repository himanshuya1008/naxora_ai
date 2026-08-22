import { format } from 'date-fns';
import { ShieldCheck, LogOut, Monitor } from 'lucide-react';
import ProfileSection from '../ProfileSection/ProfileSection.jsx';
import ComingSoonBadge from '../ComingSoonBadge/ComingSoonBadge.jsx';
import Button from '../../common/Button.jsx';
import './SecurityPanel.css';

export default function SecurityPanel({ user, onLogout }) {
  return (
    <ProfileSection title="Security" description="Session activity and sign-in controls." delay={0.15}>
      <div className="security-panel__row">
        <div className="security-panel__label-group">
          <ShieldCheck size={16} className="security-panel__icon" />
          <div>
            <p className="security-panel__label">Last login</p>
            <p className="security-panel__value">
              {user?.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM d, yyyy h:mm a') : 'This is your first session'}
            </p>
          </div>
        </div>
      </div>

      <div className="security-panel__session-note">
        <Monitor size={16} className="security-panel__icon" />
        <p>You&apos;re signed in on this device. Multi-device session tracking isn&apos;t available yet.</p>
      </div>

      <div className="security-panel__divider" />

      <div className="security-panel__actions">
        <Button variant="secondary" onClick={onLogout}>
          <LogOut size={14} />
          Sign out
        </Button>

        <div className="security-panel__disabled-action">
          <Button variant="secondary" disabled>
            Sign out of all other devices
          </Button>
          <ComingSoonBadge />
        </div>
      </div>
    </ProfileSection>
  );
}
