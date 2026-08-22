import { useEffect } from 'react';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking.js';
import Hero from '../../components/Hero/Hero.jsx';
import PricingCard from '../../components/PricingCard/PricingCard.jsx';
import CTA from '../../components/CTA/CTA.jsx';
import { PLANS } from '../../data/pricing.js';
import './Pricing.css';

export default function Pricing() {
  const { trackEvent } = useBehaviorTracking();

  useEffect(() => {
    trackEvent('PRICING_VIEW', { page: '/pricing' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pricing">
      <Hero
        eyebrow="Pricing"
        title="Simple, transparent plans"
        highlight="that scale with your pipeline"
        showScrollIndicator={false}
      />

      <section className="pricing__plans">
        <div className="pricing__plans-grid">
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.name} {...plan} delay={i * 0.06} />
          ))}
        </div>
      </section>

      <CTA
        title="Not sure which plan fits?"
        subtitle="Talk to our AI Sales Consultant — it'll ask a few questions and recommend the right plan."
        primaryCta={{ label: 'Talk to AI', to: '/ai-consultant' }}
      />
    </div>
  );
}
