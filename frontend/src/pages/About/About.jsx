import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Brain, ShieldCheck, Gauge } from 'lucide-react';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking.js';
import Hero from '../../components/Hero/Hero.jsx';
import CTA from '../../components/CTA/CTA.jsx';
import { fadeInUp, staggerContainer, easeTransition, viewportOnce } from '../../animations/variants.js';
import './About.css';

const VALUES = [
  {
    icon: Target,
    title: 'Context over scripts',
    description: 'A sales conversation grounded in what a visitor actually did on your site beats a generic script every time — that\'s the whole premise of what we build.',
  },
  {
    icon: Brain,
    title: 'Explainable, not opaque',
    description: 'Every score and recommendation our platform produces traces back to a real signal. If a sales rep asks "why," there\'s always a concrete answer.',
  },
  {
    icon: Gauge,
    title: 'Built for production',
    description: 'We design for the messy reality of real traffic and real conversations, not just the happy-path demo.',
  },
  {
    icon: ShieldCheck,
    title: 'Careful with data',
    description: 'Visitor and customer data is scoped, multi-tenant, and only ever used to serve the organization that collected it.',
  },
];

export default function About() {
  const { trackEvent } = useBehaviorTracking();

  useEffect(() => {
    trackEvent('PAGE_VIEW', { page: '/about' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="about">
      <Hero
        eyebrow="About us"
        title="We build AI that"
        highlight="understands intent"
        subtitle="An AI-native sales intelligence platform — behavior tracking, Customer DNA profiling, and a real-time voice consultant, built to work together instead of as disconnected tools."
        showScrollIndicator={false}
      />

      <section className="about__section">
        <motion.div className="about__mission" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportOnce} transition={easeTransition}>
          <h2 className="about__mission-title">Our approach</h2>
          <p className="about__mission-text">
            Most sales tools treat every visitor the same until a human eventually talks to them. We think the moment a visitor lands on your site is
            already full of signal — what they click, how long they linger on pricing, what they search for. Our platform turns that signal into a
            live customer profile, then puts it to work: in a voice conversation that already knows the context, in a dashboard your team can act on,
            and in lead scoring that reflects real behavior instead of a form fill.
          </p>
        </motion.div>
      </section>

      <section className="about__section about__section--values">
        <motion.div className="about__values-grid" variants={staggerContainer(0.08)} initial="hidden" whileInView="visible" viewport={viewportOnce}>
          {VALUES.map((value) => (
            <motion.div key={value.title} className="about__value-card" variants={fadeInUp} transition={easeTransition}>
              <span className="about__value-icon">
                <value.icon size={18} />
              </span>
              <h3 className="about__value-title">{value.title}</h3>
              <p className="about__value-description">{value.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <CTA
        title="Want to see it in action?"
        subtitle="Talk to the AI Sales Consultant yourself, or book time with our team."
        primaryCta={{ to: '/ai-consultant', label: 'Talk to AI' }}
        secondaryCta={{ to: '/book-demo', label: 'Book a demo' }}
      />
    </div>
  );
}
