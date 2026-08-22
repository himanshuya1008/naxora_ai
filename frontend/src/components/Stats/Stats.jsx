import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, easeTransition, viewportOnce } from '../../animations/variants.js';
import './Stats.css';

/** Reusable stat-row section — takes `stats: [{ value, label }]` so any page can drop one in. */
export default function Stats({ stats, title, subtitle }) {
  return (
    <section className="stats">
      <div className="stats__inner">
        {(title || subtitle) && (
          <div className="stats__header">
            {title && <h2 className="stats__title">{title}</h2>}
            {subtitle && <p className="stats__subtitle">{subtitle}</p>}
          </div>
        )}
        <motion.div
          className="stats__grid"
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} className="stats__item" variants={fadeInUp} transition={easeTransition}>
              <span className="stats__value">{stat.value}</span>
              <span className="stats__label">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
