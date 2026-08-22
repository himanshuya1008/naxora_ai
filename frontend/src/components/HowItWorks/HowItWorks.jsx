import { motion } from 'framer-motion';
import { Globe, Fingerprint, Mic, UserCheck, LayoutDashboard } from 'lucide-react';
import { fadeInUp, staggerContainer, easeTransition, viewportOnce } from '../../animations/variants.js';
import './HowItWorks.css';

const STEPS = [
  {
    icon: Globe,
    title: 'Visitor',
    description: 'Someone lands on your site and starts browsing services and pricing.',
  },
  {
    icon: Fingerprint,
    title: 'AI',
    description: 'Behavior is tracked in real time and built into a live Customer DNA profile.',
  },
  {
    icon: Mic,
    title: 'Conversation',
    description: 'The AI Sales Consultant opens a voice conversation already informed about their intent.',
  },
  {
    icon: UserCheck,
    title: 'Lead',
    description: 'Structured lead data — company, budget, timeline, goals — is captured automatically.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'Everything flows into your live dashboard: leads, analytics, and full conversation reports.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="how-it-works__header">
        <h2 className="how-it-works__title">How it works</h2>
        <p className="how-it-works__subtitle">From an anonymous visitor to a qualified, dashboard-ready lead — automatically.</p>
      </div>

      <motion.div
        className="how-it-works__track"
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <div className="how-it-works__line" aria-hidden="true" />
        {STEPS.map((step, i) => (
          <motion.div key={step.title} className="how-it-works__step" variants={fadeInUp} transition={easeTransition}>
            <span className="how-it-works__node">
              <step.icon size={20} />
              <span className="how-it-works__index">{i + 1}</span>
            </span>
            <h3 className="how-it-works__step-title">{step.title}</h3>
            <p className="how-it-works__step-description">{step.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
