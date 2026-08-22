import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { INDUSTRIES } from '../../data/industries.js';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking.js';
import Hero from '../../components/Hero/Hero.jsx';
import CTA from '../../components/CTA/CTA.jsx';
import { fadeInUp, staggerContainer, easeTransition, viewportOnce } from '../../animations/variants.js';
import './Industries.css';

export default function Industries() {
  const { trackEvent } = useBehaviorTracking();

  useEffect(() => {
    trackEvent('PAGE_VIEW', { page: '/industries' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="industries">
      <Hero
        eyebrow="Industries"
        title="Built for how your"
        highlight="industry actually sells"
        subtitle="Every industry has a different sales motion, compliance bar, and buying committee. Here's how we adapt to yours."
        showScrollIndicator={false}
      />

      <section className="industries__section">
        <motion.div className="industries__grid" variants={staggerContainer(0.06)} initial="hidden" whileInView="visible" viewport={viewportOnce}>
          {INDUSTRIES.map((industry) => (
            <motion.div key={industry.slug} className="industries__card" variants={fadeInUp} transition={easeTransition}>
              <h3 className="industries__card-title">{industry.name}</h3>
              <p className="industries__card-description">{industry.description}</p>
              {industry.services.length > 0 && (
                <div className="industries__card-services">
                  {industry.services.slice(0, 3).map((service) => (
                    <Link key={service.slug} to={`/services/${service.slug}`} className="industries__service-chip">
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      <CTA
        title="Don't see your industry?"
        subtitle="We build custom solutions for teams whose sales motion doesn't fit a template."
        primaryCta={{ to: '/contact', label: 'Talk to us' }}
        secondaryCta={{ to: '/services', label: 'Browse all services' }}
      />
    </div>
  );
}
