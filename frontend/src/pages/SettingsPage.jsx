import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { getOrganization, updateOrganization, listTeamMembers } from '../services/organizationService.js';
import { getErrorMessage } from '../utils/errors.js';
import { toast } from '../store/toastStore.js';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import FormField from '../components/common/FormField.jsx';

// API key management lives at /app/api-keys and voice provider config at
// /app/voice-configuration (see Sidebar.jsx) — split out into their own
// dedicated admin pages so each shows up as its own nav item, matching the
// rest of the enterprise-CRM-style navigation. This page now covers just
// org-level identity and team membership.
function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <GlassCard>
        <Skeleton className="mb-4 h-4 w-28" />
        <div className="flex max-w-sm flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </GlassCard>
      <GlassCard>
        <Skeleton className="mb-4 h-4 w-16" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

export default function SettingsPage() {
  const [organization, setOrganization] = useState(null);
  const [team, setTeam] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const orgForm = useForm();

  const load = useCallback(() => {
    setLoadError(null);
    Promise.all([getOrganization(), listTeamMembers()])
      .then(([org, teamMembers]) => {
        setOrganization(org);
        orgForm.reset({ name: org.name });
        setTeam(teamMembers);
      })
      .catch((err) => setLoadError(getErrorMessage(err, 'Failed to load organization settings.')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSaveOrg = async (values) => {
    try {
      const updated = await updateOrganization(values);
      setOrganization(updated);
      toast.success('Organization updated.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update organization.'));
    }
  };

  if (loadError) {
    return <ErrorState description={loadError} onRetry={load} />;
  }

  const loaded = organization && team;

  return (
    <AnimatePresence mode="wait">
      {!loaded ? (
        <motion.div key="skeleton" exit={{ opacity: 0 }}>
          <SettingsSkeleton />
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
          <GlassCard>
            <h2 className="mb-4 card-title">Organization</h2>
            <form onSubmit={orgForm.handleSubmit(onSaveOrg)} className="flex max-w-sm flex-col gap-4">
              <FormField label="Organization name">
                <input className="input-field" {...orgForm.register('name')} />
              </FormField>
              <Button type="submit" loading={orgForm.formState.isSubmitting} className="w-fit">
                Save changes
              </Button>
            </form>
          </GlassCard>

          <GlassCard>
            <h2 className="mb-4 card-title">Team</h2>
            {team.length === 0 ? (
              <EmptyState icon={Users} title="No team members yet" />
            ) : (
              <div className="flex flex-col divide-y divide-line/60">
                {team.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{member.name}</p>
                      <p className="text-xs text-ink-faint">{member.email}</p>
                    </div>
                    <Badge tone="neutral">{member.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
