import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic } from 'lucide-react';
import { getVoiceSettings, updateVoiceSettings } from '../services/voiceSettingsService.js';
import { getErrorMessage } from '../utils/errors.js';
import { toast } from '../store/toastStore.js';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';
import FormField from '../components/common/FormField.jsx';
import LanguageSelect from '../components/voice/LanguageSelect.jsx';
import { getSelectedLanguage, setSelectedLanguage } from '../services/voice/languagePreference.js';

function VoiceConfigSkeleton() {
  return (
    <GlassCard>
      <Skeleton className="mb-4 h-4 w-32" />
      <Skeleton className="h-10 w-full max-w-sm" />
    </GlassCard>
  );
}

export default function VoiceConfigPage() {
  const [voiceSettings, setVoiceSettings] = useState(null);
  const [unavailable, setUnavailable] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [language, setLanguage] = useState(getSelectedLanguage);
  const voiceForm = useForm();

  const load = useCallback(() => {
    setLoadError(null);
    setUnavailable(false);
    getVoiceSettings()
      .then((v) => {
        setVoiceSettings(v);
        voiceForm.reset({ voiceId: v.voiceId });
      })
      .catch(() => setUnavailable(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async (values) => {
    try {
      const updated = await updateVoiceSettings(values);
      setVoiceSettings(updated);
      toast.success('Voice settings saved.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save voice settings.'));
    }
  };

  const handleLanguageChange = (next) => {
    setLanguage(next);
    setSelectedLanguage(next);
    toast.success('Default conversation language updated.');
  };

  if (loadError) {
    return <ErrorState description={loadError} onRetry={load} />;
  }

  if (!voiceSettings && !unavailable) {
    return <VoiceConfigSkeleton />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Mic className="h-4 w-4 text-bronze" />
            <div>
              <h2 className="card-title">Default conversation language</h2>
              <p className="card-subtitle">Applied to every new voice call started from the AI Sales Consultant.</p>
            </div>
          </div>
          <LanguageSelect value={language} onChange={handleLanguageChange} />
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Mic className="h-4 w-4 text-bronze" />
            <div>
              <h2 className="card-title">Voice provider</h2>
              <p className="card-subtitle">Speech-to-text and text-to-speech used for AI voice conversations.</p>
            </div>
          </div>
          {unavailable ? (
            <EmptyState
              icon={Mic}
              title="Voice provider settings aren't connected yet"
              description="Live voice calls already run on Vapi (see the language selector above) — this organization-level override just isn't wired up on the backend yet."
            />
          ) : (
            <form onSubmit={voiceForm.handleSubmit(onSave)} className="flex max-w-sm flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="label-text">Speech-to-text</p>
                  <p className="text-sm font-medium text-ink-2">{voiceSettings.sttProvider}</p>
                </div>
                <div>
                  <p className="label-text">Text-to-speech</p>
                  <p className="text-sm font-medium text-ink-2">{voiceSettings.ttsProvider}</p>
                </div>
              </div>
              <FormField label="AI voice">
                <select className="input-field" {...voiceForm.register('voiceId')}>
                  {voiceSettings.availableVoices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <Button type="submit" loading={voiceForm.formState.isSubmitting} className="w-fit">
                Save changes
              </Button>
            </form>
          )}
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
