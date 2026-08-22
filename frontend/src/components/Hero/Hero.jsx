import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronDown } from 'lucide-react';
import Button from '../Button/Button.jsx';
import CursorGlow from '../common/CursorGlow.jsx';
import { fadeInUp, staggerContainer, easeTransition } from '../../animations/variants.js';
import './Hero.css';

/**
 * Reusable hero section — accepts content so it can anchor Home now and any
 * other top-of-page moment later (Phase 2+) without duplicating the layout.
 */
export default function Hero({ eyebrow, title, highlight, subtitle, primaryCta, secondaryCta, showScrollIndicator = true, compact = false, visual }) {
  return (
    <section className={`hero ${compact ? 'hero--compact' : ''}`}>
      <div className="hero__mesh" aria-hidden="true" />
      <div className="hero__rays" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__glow hero__glow--accent" aria-hidden="true" />
      <div className="hero__glow hero__glow--cyan" aria-hidden="true" />
      <div className="hero__glow hero__glow--soft" aria-hidden="true" />
      <CursorGlow />
      {/* Absolutely positioned so an optional decorative illustration never
          reflows the centered text column below — safe to add per-page
          without risking the existing hero layout. */}
      {visual && (
        <div className="hero__visual" aria-hidden="true">
          {visual}
        </div>
      )}

      <motion.div className="hero__inner" variants={staggerContainer(0.12)} initial="hidden" animate="visible">
        {eyebrow && (
          <motion.div className="hero__eyebrow" variants={fadeInUp} transition={easeTransition}>
            <Sparkles size={14} />
            {eyebrow}
          </motion.div>
        )}

        <motion.h1 className="hero__title" variants={fadeInUp} transition={easeTransition}>
          {title} {highlight && <span className="hero__highlight">{highlight}</span>}
        </motion.h1>

        {subtitle && (
          <motion.p className="hero__subtitle" variants={fadeInUp} transition={easeTransition}>
            {subtitle}
          </motion.p>
        )}

        {(primaryCta || secondaryCta) && (
          <motion.div className="hero__actions" variants={fadeInUp} transition={easeTransition}>
            {primaryCta && (
              <Link to={primaryCta.to}>
                <Button className="hero__primary-btn">
                  {primaryCta.label}
                  <ArrowRight size={16} className="hero__btn-arrow" />
                </Button>
              </Link>
            )}
            {secondaryCta && (
              <Link to={secondaryCta.to}>
                <Button variant="secondary" className="hero__secondary-btn">
                  {secondaryCta.label}
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </motion.div>

      {showScrollIndicator && (
        <motion.div
          className="hero__scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          aria-hidden="true"
        >
          <span className="hero__scroll-label">Scroll</span>
          <motion.span
            className="hero__scroll-icon"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={16} />
          </motion.span>
        </motion.div>
      )}
    </section>
  );
}
