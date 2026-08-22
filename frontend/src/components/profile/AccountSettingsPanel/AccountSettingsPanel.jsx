import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import ProfileSection from '../ProfileSection/ProfileSection.jsx';
import ComingSoonBadge from '../ComingSoonBadge/ComingSoonBadge.jsx';
import DeleteAccountModal from '../DeleteAccountModal/DeleteAccountModal.jsx';
import Button from '../../common/Button.jsx';
import './AccountSettingsPanel.css';

export default function AccountSettingsPanel({ user }) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <ProfileSection title="Account settings" description="Manage your personal account details." delay={0.05}>
      <div className="account-settings-panel__row">
        <div className="account-settings-panel__field">
          <label className="account-settings-panel__label">Name</label>
          <input className="account-settings-panel__input" value={user?.name ?? ''} readOnly />
        </div>
        <ComingSoonBadge />
      </div>

      <div className="account-settings-panel__row">
        <div className="account-settings-panel__field">
          <label className="account-settings-panel__label">Password</label>
          <input className="account-settings-panel__input" type="password" value="••••••••••••" readOnly />
        </div>
        <ComingSoonBadge />
      </div>

      <div className="account-settings-panel__divider" />

      <div className="account-settings-panel__danger">
        <div>
          <p className="account-settings-panel__danger-title">Delete account</p>
          <p className="account-settings-panel__danger-description">Permanently delete your account and all associated access.</p>
        </div>
        <Button variant="secondary" onClick={() => setDeleteOpen(true)} className="account-settings-panel__danger-btn">
          <Trash2 size={14} />
          Delete account
        </Button>
      </div>

      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </ProfileSection>
  );
}
