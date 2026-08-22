import { SERVICES, getServiceHref } from '../../data/services.js';
import Hero from '../../components/Hero/Hero.jsx';
import TrustedBy from '../../components/TrustedBy/TrustedBy.jsx';
import ServiceCard from '../../components/ServiceCard/ServiceCard.jsx';
import CTA from '../../components/CTA/CTA.jsx';
import './Services.css';

export default function Services() {
  return (
    <div className="services">
      <Hero
        eyebrow="What we do"
        title="Twelve specialized capabilities,"
        highlight="one team"
        subtitle="From the AI Sales Consultant itself to cloud infrastructure and security — everything you need to modernize how your business runs."
        primaryCta={{ label: 'Book a demo', to: '/book-demo' }}
        secondaryCta={{ label: 'Talk to AI', to: '/ai-consultant' }}
        showScrollIndicator={false}
        compact
      />

      <TrustedBy />

      <section className="services__grid-section">
        <div className="services__grid">
          {SERVICES.map((service, i) => (
            <ServiceCard
              key={service.slug}
              icon={service.icon}
              title={service.name}
              description={service.tagline}
              benefits={service.benefits}
              technologies={service.technologies}
              to={getServiceHref(service)}
              delay={i * 0.04}
            />
          ))}
        </div>
      </section>

      <CTA
        title="Not sure where to start?"
        subtitle="Talk to our AI Sales Consultant — it'll ask a few questions and point you to the right service."
        primaryCta={{ label: 'Talk to AI', to: '/ai-consultant' }}
        secondaryCta={{ label: 'Book a demo', to: '/book-demo' }}
      />
    </div>
  );
}
