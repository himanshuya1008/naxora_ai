import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Camera } from 'lucide-react';
import { fadeInUp, easeTransition } from '../../../animations/variants.js';
import Badge from '../../common/Badge.jsx';
import ComingSoonBadge from '../ComingSoonBadge/ComingSoonBadge.jsx';
import './ProfileHeader.css';

const ROLE_TONE = {
  OWNER: 'accent',
  ADMIN: 'good',
  SALES_REP: 'neutral',
  VIEWER: 'neutral',
};

export default function ProfileHeader({ user, organizationName }) {
  return (
    <motion.div
      className="profile-header"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={easeTransition}
    >
      <div className="profile-header__avatar-wrap">
        <span className="profile-header__avatar">{user?.name?.[0]?.toUpperCase() ?? '?'}</span>
        <button className="profile-header__avatar-edit" disabled title="Photo upload coming soon">
          <Camera size={14} />
        </button>
        <div className="profile-header__avatar-badge">
          <ComingSoonBadge />
        </div>
      </div>

      <div className="profile-header__info">
        <div className="profile-header__name-row">
          <h1 className="profile-header__name">{user?.name}</h1>
          <Badge tone={ROLE_TONE[user?.role] ?? 'neutral'}>{user?.role}</Badge>
        </div>
        <p className="profile-header__email">{user?.email}</p>
        <div className="profile-header__meta">
          <span>{organizationName}</span>
          <span className="profile-header__meta-dot" aria-hidden="true" />
          <span>Joined {user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—'}</span>
        </div>
      </div>
    </motion.div>
  );
}
