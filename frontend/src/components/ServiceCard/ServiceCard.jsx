import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { fadeInUp, easeTransition, viewportOnce } from '../../animations/variants.js';
import './ServiceCard.css';

export default function ServiceCard({ icon: Icon, title, description, benefits, technologies, to, delay = 0 }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ ...easeTransition, delay }}
    >
      <Link to={to} className="service-card">
        <span className="service-card__shine" aria-hidden="true" />
        <span className="service-card__icon">
          <Icon size={20} />
        </span>
        <h3 className="service-card__title">{title}</h3>
        <p className="service-card__description">{description}</p>
        {benefits && benefits.length > 0 && (
          <ul className="service-card__benefits">
            {benefits.slice(0, 3).map((b) => (
              <li key={b}>
                <Check size={13} />
                {b}
              </li>
            ))}
          </ul>
        )}
        {technologies && technologies.length > 0 && (
          <div className="service-card__tech">
            {technologies.slice(0, 3).map((t) => (
              <span key={t} className="service-card__tech-tag">
                {t}
              </span>
            ))}
          </div>
        )}
        <span className="service-card__link">
          Learn more <ArrowRight size={14} />
        </span>
      </Link>
    </motion.div>
  );
}
