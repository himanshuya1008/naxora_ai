import { motion } from 'framer-motion';
import { fadeInUp, easeTransition, viewportOnce } from '../../../animations/variants.js';
import './ProfileSection.css';

export default function ProfileSection({ title, description, action, children, delay = 0 }) {
  return (
    <motion.section
      className="profile-section"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ ...easeTransition, delay }}
    >
      <div className="profile-section__header">
        <div>
          <h2 className="profile-section__title">{title}</h2>
          {description && <p className="profile-section__description">{description}</p>}
        </div>
        {action}
      </div>
      <div className="profile-section__body">{children}</div>
    </motion.section>
  );
}
