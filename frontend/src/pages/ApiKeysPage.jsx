import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Trash2, Copy, Check, KeyRound, Loader2 } from 'lucide-react';
import { listApiKeys, createApiKey, revokeApiKey } from '../services/organizationService.js';
import { getErrorMessage } from '../utils/errors.js';
import { toast } from '../store/toastStore.js';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import FormField from '../components/common/FormField.jsx';

function ApiKeysSkeleton() {
  return (
    <GlassCard>
      <Skeleton className="mb-4 h-4 w-36" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </GlassCard>
  );
}

export default function ApiKeysPage() {
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

  if (loadError) {
    return <ErrorState description={loadError} onRetry={load} />;
  }

  if (!apiKeys) {
    return <ApiKeysSkeleton />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="card-title">Tracking API keys</h2>
              <p className="card-subtitle">Used to authenticate the website tracking snippet and public lead forms.</p>
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              New key
            </Button>
          </div>

          {apiKeys.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              title="No API keys yet"
              description="Create a key to authenticate the tracking snippet on your site."
              action={
                <Button variant="secondary" onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create your first key
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col divide-y divide-line/60">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{key.label}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="text-xs text-ink-faint">{key.key}</code>
                      <button
                        onClick={() => copyKey(key.key, key.id)}
                        aria-label="Copy API key"
                        className="text-ink-faint hover:text-ink-2"
                      >
                        {copiedId === key.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-ink-faint">Created {format(new Date(key.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {key.revokedAt ? (
                      <Badge tone="critical">Revoked</Badge>
                    ) : revokingId === key.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />
                    ) : (
                      <button onClick={() => onRevokeKey(key.id)} aria-label="Revoke API key" className="text-ink-faint hover:text-critical">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create API key">
          <form onSubmit={keyForm.handleSubmit(onCreateKey)} className="flex flex-col gap-4">
            <FormField label="Label">
              <input className="input-field" placeholder="Marketing site" {...keyForm.register('label', { required: true })} />
            </FormField>
            <Button type="submit" loading={keyForm.formState.isSubmitting} className="w-full">
              Create key
            </Button>
          </form>
        </Modal>
      </motion.div>
    </AnimatePresence>
  );
}
