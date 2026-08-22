import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '../Button/Button.jsx';
import { fadeInUp, easeTransition, viewportOnce } from '../../animations/variants.js';
import './CTA.css';

/** Reusable closing call-to-action band — used at the end of any marketing page. */
export default function CTA({ title, subtitle, primaryCta, secondaryCta }) {
  return (
    <section className="cta">
      <motion.div
        className="cta__card"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        transition={easeTransition}
      >
        <div className="cta__glow" aria-hidden="true" />
        <h2 className="cta__title">{title}</h2>
        {subtitle && <p className="cta__subtitle">{subtitle}</p>}
        <div className="cta__actions">
          {primaryCta && (
            <Link to={primaryCta.to}>
              <Button>
                {primaryCta.label}
                <ArrowRight size={16} />
              </Button>
            </Link>
          )}
          {secondaryCta && (
            <Link to={secondaryCta.to}>
              <Button variant="secondary">{secondaryCta.label}</Button>
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  );
}
