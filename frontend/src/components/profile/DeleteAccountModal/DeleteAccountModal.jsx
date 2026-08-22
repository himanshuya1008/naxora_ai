import Modal from '../../common/Modal.jsx';
import Button from '../../common/Button.jsx';
import ComingSoonBadge from '../ComingSoonBadge/ComingSoonBadge.jsx';
import './DeleteAccountModal.css';

export default function DeleteAccountModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete account">
      <div className="delete-account-modal">
        <p className="delete-account-modal__warning">
          This will permanently delete your account and remove your access to this organization. This action cannot be undone.
        </p>
        <div className="delete-account-modal__notice">
          <ComingSoonBadge />
          <span>Account deletion isn&apos;t available yet. Contact support to request account deletion.</span>
        </div>
        <div className="delete-account-modal__actions">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Cancel
          </Button>
          <Button disabled className="delete-account-modal__confirm">
            Delete my account
          </Button>
        </div>
      </div>
    </Modal>
  );
}
