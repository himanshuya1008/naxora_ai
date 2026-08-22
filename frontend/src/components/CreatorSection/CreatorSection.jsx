import { motion } from 'framer-motion';
import { Github, Linkedin, User } from 'lucide-react';
import { fadeInUp, easeTransition, viewportOnce } from '../../animations/variants.js';
import './CreatorSection.css';

// Placeholder identity — swap `avatarSrc` for a real photo URL and update
// these fields when ready. Leaving avatarSrc null renders the styled
// monogram/icon placeholder below instead of a broken <img>.
const CREATOR = {
  name: 'Your Name',
  role: 'Founder & Full-Stack Engineer',
  bio: 'Designed and built Nexora AI end to end — the voice AI pipeline, the Customer DNA engine, and everything in between.',
  avatarSrc: null,
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
};

export default function CreatorSection() {
  return (
    <section className="creator">
      <motion.div className="creator__card" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportOnce} transition={easeTransition}>
        <div className="creator__avatar-wrap">
          <span className="creator__avatar-ring" aria-hidden="true" />
          <span className="creator__avatar">
            {CREATOR.avatarSrc ? <img src={CREATOR.avatarSrc} alt={CREATOR.name} /> : <User size={32} />}
          </span>
        </div>

        <p className="creator__eyebrow">Built by</p>
        <h3 className="creator__name">{CREATOR.name}</h3>
        <p className="creator__role">{CREATOR.role}</p>
        <p className="creator__bio">{CREATOR.bio}</p>

        <div className="creator__links">
          <a href={CREATOR.github} target="_blank" rel="noreferrer" className="creator__link">
            <Github size={16} />
            GitHub
          </a>
          <a href={CREATOR.linkedin} target="_blank" rel="noreferrer" className="creator__link">
            <Linkedin size={16} />
            LinkedIn
          </a>
        </div>
      </motion.div>
    </section>
  );
}
