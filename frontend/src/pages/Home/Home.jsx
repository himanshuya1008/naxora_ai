import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Brain, LineChart, Fingerprint, Target, Radio, UsersRound, Activity } from 'lucide-react';
import Hero from '../../components/Hero/Hero.jsx';
import HeroFigureScene from '../../components/illustrations/HeroFigureScene.jsx';
import TrustedBy from '../../components/TrustedBy/TrustedBy.jsx';
import ServiceCard from '../../components/ServiceCard/ServiceCard.jsx';
import HowItWorks from '../../components/HowItWorks/HowItWorks.jsx';
import DashboardPreview from '../../components/DashboardPreview/DashboardPreview.jsx';
import CaseStudyCard from '../../components/CaseStudyCard/CaseStudyCard.jsx';
import TestimonialCard from '../../components/TestimonialCard/TestimonialCard.jsx';
import PricingCard from '../../components/PricingCard/PricingCard.jsx';
import FAQ from '../../components/FAQ/FAQ.jsx';
import CTA from '../../components/CTA/CTA.jsx';
import Stats from '../../components/Stats/Stats.jsx';
import VideoShowcase from '../../components/VideoShowcase/VideoShowcase.jsx';
import CreatorSection from '../../components/CreatorSection/CreatorSection.jsx';
import AnimatedCounter from '../../components/common/AnimatedCounter.jsx';
import { SERVICES, getServiceHref } from '../../data/services.js';
import { PLANS } from '../../data/pricing.js';
import { FAQ_ITEMS } from '../../data/faq.js';
import { fadeInUp, easeTransition, viewportOnce } from '../../animations/variants.js';
import './Home.css';

const PILLARS = [
  { icon: Mic, label: 'Voice AI' },
  { icon: Fingerprint, label: 'Customer DNA' },
  { icon: UsersRound, label: 'Lead Intelligence' },
  { icon: Activity, label: 'Real-Time Analytics' },
];

const PLATFORM_STATS = [
  { value: <AnimatedCounter value={2} prefix="<" suffix=" min" />, label: 'Average time to first response' },
  { value: <AnimatedCounter value={24} suffix="/7" />, label: 'AI availability, every visitor' },
  { value: <AnimatedCounter value={60} suffix="%+" />, label: 'Less manual lead qualification' },
  { value: <AnimatedCounter value={100} suffix="%" />, label: 'Real-time Customer DNA updates' },
];

const DIFFERENTIATORS = [
  {
    icon: Fingerprint,
    title: 'Customer DNA',
    description:
      'Every visitor gets a behavior-derived profile — buying intent, budget sensitivity, technical knowledge, and likely objections — before a conversation ever starts.',
  },
  {
    icon: Brain,
    title: 'Conversation Brain',
    description: 'After every turn, the AI re-reasons: context, intent, objections, and strategy — then speaks like a sales consultant, never a scripted bot.',
  },
  {
    icon: Mic,
    title: 'Real-time Voice',
    description: 'A live, natural voice conversation over a streaming connection — sub-second turn-taking, instant interruption, and a voice that never sounds scripted.',
  },
  {
    icon: LineChart,
    title: 'Live Analytics',
    description: 'Interest score, trust score, and buying probability update in real time as the conversation unfolds.',
  },
  {
    icon: Target,
    title: 'Objection Prediction',
    description: 'The Strategy Engine predicts likely objections from behavior and DNA, and prepares the right rebuttal before it comes up.',
  },
  {
    icon: Radio,
    title: 'Full Sales Reports',
    description: 'Every call ends with a transcript, performance score, missed opportunities, follow-up plan, and a CRM-ready summary.',
  },
];

// Derived from the real service catalog rather than invented — a
// representative slice of the industries our services already list.
const INDUSTRIES = [...new Set(SERVICES.flatMap((s) => s.industries))].slice(0, 8);

// Illustrative examples — no real customers exist yet (see data/services.js
// header for the same convention used across this marketing site).
const CASE_STUDIES = [
  {
    company: 'Northwind Retail',
    industry: 'E-commerce',
    result: '3.2x faster lead qualification',
    description: 'Replaced a manual intake form with the AI Sales Consultant, cutting time-to-first-response from hours to under two minutes.',
  },
  {
    company: 'Contoso Cloud',
    industry: 'B2B SaaS',
    result: '47% more demo bookings',
    description: 'Customer DNA profiling let their sales team walk into every demo already knowing the visitor’s budget and timeline.',
  },
  {
    company: 'Fabrikam Health',
    industry: 'Healthcare',
    result: '60% less manual discovery',
    description: 'Objection prediction meant reps stopped re-asking questions visitors had already answered through behavior.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The AI Sales Consultant already knew what pricing tier our visitor was looking at before it said a word. That changed how fast our team could follow up.',
    role: 'Head of Sales',
    company: 'Northwind Retail',
  },
  {
    quote: 'We stopped losing leads to slow response times. Every conversation now ends with a structured summary our reps can act on immediately.',
    role: 'VP of Revenue Operations',
    company: 'Contoso Cloud',
  },
  {
    quote: 'Our dashboard finally shows live numbers instead of a weekly export. It’s the first analytics view our whole team actually opens.',
    role: 'Director of Growth',
    company: 'Fabrikam Health',
  },
];

export default function Home() {
  return (
    <div className="home">
      <Hero
        eyebrow="Enterprise AI Sales Intelligence"
        title="Your AI sales consultant already knows"
        highlight="why they're here"
        subtitle="Instead of opening with “how can I help you?”, it studies every page, every pause, every pricing visit — builds a Customer DNA profile — then starts a real voice conversation already informed."
        primaryCta={{ label: 'Book a demo', to: '/book-demo' }}
        secondaryCta={{ label: 'Talk to AI', to: '/ai-consultant' }}
        visual={<HeroFigureScene />}
      />

      <motion.div className="home__pillars" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportOnce} transition={easeTransition}>
        {PILLARS.map((pillar) => (
          <div key={pillar.label} className="home__pillar">
            <pillar.icon size={15} />
            {pillar.label}
          </div>
        ))}
      </motion.div>

      <TrustedBy />

      <Stats stats={PLATFORM_STATS} title="Built for how enterprise sales actually works" />

      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">Everything we build for you</h2>
          <p className="home__section-subtitle">
            From the AI Sales Consultant itself to the infrastructure and security behind it — twelve capabilities, one team.
          </p>
        </div>
        <div className="home__services-grid">
          {SERVICES.map((service, i) => (
            <ServiceCard
              key={service.slug}
              icon={service.icon}
              title={service.name}
              description={service.tagline}
              benefits={service.benefits}
              to={getServiceHref(service)}
              delay={i * 0.03}
            />
          ))}
        </div>
      </section>

      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">Why teams choose us</h2>
          <p className="home__section-subtitle">Not a chatbot demo — a full behavioral sales pipeline built for real outcomes.</p>
        </div>
        <div className="home__differentiators-grid">
          {DIFFERENTIATORS.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              transition={{ ...easeTransition, delay: i * 0.05 }}
            >
              <span className="feature-card__icon">
                <feature.icon size={20} />
              </span>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <HowItWorks />

      <DashboardPreview />

      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">See it in action</h2>
          <p className="home__section-subtitle">Short walkthroughs of the platform, the voice AI, and the dashboard.</p>
        </div>
        <VideoShowcase />
      </section>

      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">Industries we serve</h2>
          <p className="home__section-subtitle">Built to adapt across regulated, high-volume, and relationship-driven sales motions alike.</p>
        </div>
        <div className="home__industries-grid">
          {INDUSTRIES.map((industry) => (
            <span key={industry} className="home__industry-tag">
              {industry}
            </span>
          ))}
        </div>
        <div className="home__section-footer">
          <Link to="/industries" className="home__section-link">
            See all industries →
          </Link>
        </div>
      </section>

      <section className="home__section">
        <div className="home__section-header">
          <span className="home__section-eyebrow">Illustrative examples</span>
          <h2 className="home__section-title">Case studies</h2>
          <p className="home__section-subtitle">Representative outcomes across the industries we work with.</p>
        </div>
        <div className="home__case-studies-grid">
          {CASE_STUDIES.map((cs, i) => (
            <CaseStudyCard key={cs.company} {...cs} delay={i * 0.06} />
          ))}
        </div>
        <div className="home__section-footer">
          <Link to="/case-studies" className="home__section-link">
            View all case studies →
          </Link>
        </div>
      </section>

      <section className="home__section">
        <div className="home__section-header">
          <span className="home__section-eyebrow">Illustrative examples</span>
          <h2 className="home__section-title">What teams are saying</h2>
        </div>
        <div className="home__testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.company} {...t} delay={i * 0.06} />
          ))}
        </div>
      </section>

      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">Simple, transparent pricing</h2>
          <p className="home__section-subtitle">Plans that scale from your first tracked visitor to enterprise volume.</p>
        </div>
        <div className="home__pricing-grid">
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.name} {...plan} delay={i * 0.06} />
          ))}
        </div>
        <div className="home__section-footer">
          <Link to="/pricing" className="home__section-link">
            See full pricing &amp; feature comparison →
          </Link>
        </div>
      </section>

      <FAQ items={FAQ_ITEMS} />

      <CreatorSection />

      <CTA
        title="See it work on your own site"
        subtitle="Book a live demo with our team, or talk to the AI Sales Consultant yourself right now."
        primaryCta={{ label: 'Book a demo', to: '/book-demo' }}
        secondaryCta={{ label: 'Talk to AI', to: '/ai-consultant' }}
      />
    </div>
  );
}
