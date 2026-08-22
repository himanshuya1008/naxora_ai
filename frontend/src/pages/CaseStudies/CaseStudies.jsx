import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CASE_STUDIES } from '../../data/caseStudies.js';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking.js';
import Hero from '../../components/Hero/Hero.jsx';
import CTA from '../../components/CTA/CTA.jsx';
import { fadeInUp, staggerContainer, easeTransition, viewportOnce } from '../../animations/variants.js';
import './CaseStudies.css';

export default function CaseStudies() {
  const { trackEvent } = useBehaviorTracking();

  useEffect(() => {
    trackEvent('PAGE_VIEW', { page: '/case-studies' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="case-studies">
      <Hero
        eyebrow="Illustrative examples"
        title="Real problems,"
        highlight="representative outcomes"
        subtitle="A look at the kind of results teams see across the industries we work with."
        showScrollIndicator={false}
      />

      <section className="case-studies__section">
        <motion.div
          className="case-studies__grid"
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {CASE_STUDIES.map((cs) => (
            <motion.article key={cs.company} className="case-studies__card" variants={fadeInUp} transition={easeTransition}>
              <span className="case-studies__industry">{cs.industry}</span>
              <h3 className="case-studies__result">{cs.result}</h3>
              <p className="case-studies__company">{cs.company}</p>
              <p className="case-studies__description">{cs.description}</p>

              <div className="case-studies__detail">
                <p className="case-studies__detail-label">Challenge</p>
                <p className="case-studies__detail-text">{cs.challenge}</p>
              </div>
              <div className="case-studies__detail">
                <p className="case-studies__detail-label">Solution</p>
                <p className="case-studies__detail-text">{cs.solution}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <CTA
        title="Want results like these?"
        subtitle="Talk to our AI Sales Consultant, or book time with a real person."
        primaryCta={{ to: '/ai-consultant', label: 'Talk to AI' }}
        secondaryCta={{ to: '/book-demo', label: 'Book a demo' }}
      />
    </div>
  );
}
