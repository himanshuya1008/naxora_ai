import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Plus, Trash2, Copy, Check, KeyRound, Loader2 } from 'lucide-react';
import { listApiKeys, createApiKey, revokeApiKey } from '../../../services/organizationService.js';
import { getErrorMessage } from '../../../utils/errors.js';
import { toast } from '../../../store/toastStore.js';
import ProfileSection from '../ProfileSection/ProfileSection.jsx';
import Button from '../../common/Button.jsx';
import Modal from '../../common/Modal.jsx';
import FormField from '../../common/FormField.jsx';
import Badge from '../../common/Badge.jsx';
import './ApiKeysPanel.css';

export default function ApiKeysPanel() {
  const [apiKeys, setApiKeys] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const keyForm = useForm({ defaultValues: { label: '' } });

  const load = useCallback(() => {
    setLoadError(null);
    listApiKeys()
      .then(setApiKeys)
      .catch((err) => setLoadError(getErrorMessage(err, 'Failed to load API keys.')));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onCreateKey = async (values) => {
    try {
      const key = await createApiKey(values.label);
      setApiKeys((prev) => [key, ...prev]);
      keyForm.reset();
      setModalOpen(false);
      toast.success('API key created.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create the API key.'));
    }
  };

  const onRevokeKey = async (id) => {
    setRevokingId(id);
    try {
      await revokeApiKey(id);
      setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k)));
      toast.success('API key revoked.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to revoke the API key.'));
    } finally {
      setRevokingId(null);
    }
  };

  const copyKey = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    toast.success('API key copied to clipboard.');
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <ProfileSection
      title="Personal API keys"
      description="Organization-wide keys used to authenticate the website tracking snippet."
      action={
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={14} />
          New key
        </Button>
      }
      delay={0.25}
    >
      {loadError ? (
        <p className="api-keys-panel__error">{loadError}</p>
      ) : !apiKeys ? (
        <div className="api-keys-panel__loading">
          <Loader2 size={16} className="api-keys-panel__spin" />
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="api-keys-panel__empty">
          <KeyRound size={20} />
          <p>No API keys yet</p>
        </div>
      ) : (
        <div className="api-keys-panel__list">
          {apiKeys.map((key) => (
            <div key={key.id} className="api-keys-panel__row">
              <div>
                <p className="api-keys-panel__label">{key.label}</p>
                <div className="api-keys-panel__key-row">
                  <code className="api-keys-panel__key">{key.key}</code>
                  <button onClick={() => copyKey(key.key, key.id)} aria-label="Copy API key" className="api-keys-panel__icon-btn">
                    {copiedId === key.id ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="api-keys-panel__created">Created {format(new Date(key.createdAt), 'MMM d, yyyy')}</p>
              </div>
              {key.revokedAt ? (
                <Badge tone="critical">Revoked</Badge>
              ) : revokingId === key.id ? (
                <Loader2 size={16} className="api-keys-panel__spin" />
              ) : (
                <button onClick={() => onRevokeKey(key.id)} aria-label="Revoke API key" className="api-keys-panel__icon-btn api-keys-panel__icon-btn--danger">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create API key">
        <form onSubmit={keyForm.handleSubmit(onCreateKey)} className="api-keys-panel__form">
          <FormField label="Label">
            <input className="input-field" placeholder="Marketing site" {...keyForm.register('label', { required: true })} />
          </FormField>
          <Button type="submit" loading={keyForm.formState.isSubmitting} className="w-full">
            Create key
          </Button>
        </form>
      </Modal>
    </ProfileSection>
  );
}
