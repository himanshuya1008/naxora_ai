import { Link } from 'react-router-dom';
import Badge from '../../common/Badge.jsx';
import ProfileSection from '../ProfileSection/ProfileSection.jsx';
import './OrganizationPanel.css';

const ROLE_TONE = {
  OWNER: 'accent',
  ADMIN: 'good',
  SALES_REP: 'neutral',
  VIEWER: 'neutral',
};

const PLAN_TONE = {
  FREE: 'neutral',
  PRO: 'accent',
  ENTERPRISE: 'good',
};

export default function OrganizationPanel({ organization, team, currentUserId }) {
  return (
    <ProfileSection
      title="Organization"
      description="Your organization and its members."
      action={
        <Link to="/app/settings" className="organization-panel__manage-link">
          Manage in Settings
        </Link>
      }
      delay={0.1}
    >
      <div className="organization-panel__summary">
        <div>
          <p className="organization-panel__org-name">{organization?.name}</p>
          <p className="organization-panel__org-slug">{organization?.slug}</p>
        </div>
        <Badge tone={PLAN_TONE[organization?.plan] ?? 'neutral'}>{organization?.plan} plan</Badge>
      </div>

      <div className="organization-panel__members">
        <p className="organization-panel__members-label">Members ({team?.length ?? 0})</p>
        <div className="organization-panel__members-list">
          {team?.map((member) => (
            <div key={member.id} className="organization-panel__member">
              <div>
                <p className="organization-panel__member-name">
                  {member.name}
                  {member.id === currentUserId && <span className="organization-panel__you-tag">You</span>}
                </p>
                <p className="organization-panel__member-email">{member.email}</p>
              </div>
              <Badge tone={ROLE_TONE[member.role] ?? 'neutral'}>{member.role}</Badge>
            </div>
          ))}
        </div>
      </div>
    </ProfileSection>
  );
}
