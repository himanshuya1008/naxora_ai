import { useCallback, useEffect, useState } from 'react';
import { getOrganization, listTeamMembers } from '../../services/organizationService.js';
import { getErrorMessage } from '../../utils/errors.js';
import { useAuthStore } from '../../store/authStore.js';
import Skeleton from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import ProfileHeader from '../../components/profile/ProfileHeader/ProfileHeader.jsx';
import AccountSettingsPanel from '../../components/profile/AccountSettingsPanel/AccountSettingsPanel.jsx';
import OrganizationPanel from '../../components/profile/OrganizationPanel/OrganizationPanel.jsx';
import SecurityPanel from '../../components/profile/SecurityPanel/SecurityPanel.jsx';
import PreferencesPanel from '../../components/profile/PreferencesPanel/PreferencesPanel.jsx';
import ApiKeysPanel from '../../components/profile/ApiKeysPanel/ApiKeysPanel.jsx';
import './Profile.css';

function ProfileSkeleton() {
  return (
    <div className="profile-page__skeleton">
      <Skeleton className="profile-page__skeleton-header" />
      <Skeleton className="profile-page__skeleton-card" />
      <Skeleton className="profile-page__skeleton-card" />
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuthStore();
  const [organization, setOrganization] = useState(null);
  const [team, setTeam] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(() => {
    setLoadError(null);
    Promise.all([getOrganization(), listTeamMembers()])
      .then(([org, teamRes]) => {
        setOrganization(org);
        setTeam(teamRes);
      })
      .catch((err) => setLoadError(getErrorMessage(err, 'Failed to load profile data.')));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loadError) {
    return <ErrorState description={loadError} onRetry={load} />;
  }

  const loaded = organization && team;

  if (!loaded) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="profile-page">
      <ProfileHeader user={user} organizationName={organization.name} />

      <div className="profile-page__grid">
        <AccountSettingsPanel user={user} />
        <OrganizationPanel organization={organization} team={team} currentUserId={user?.id} />
        <SecurityPanel user={user} onLogout={logout} />
        <PreferencesPanel />
        <ApiKeysPanel />
      </div>
    </div>
  );
}
