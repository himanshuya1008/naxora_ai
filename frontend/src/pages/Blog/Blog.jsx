import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PenLine } from 'lucide-react';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking.js';
import Hero from '../../components/Hero/Hero.jsx';
import CTA from '../../components/CTA/CTA.jsx';
import { fadeInUp, staggerContainer, easeTransition, viewportOnce } from '../../animations/variants.js';
import './Blog.css';

// Upcoming topics, not published posts — the blog itself isn't live yet, so
// this deliberately doesn't pretend otherwise (no fake dates, authors, or
// article links). Update this list as real posts actually ship.
const UPCOMING_TOPICS = [
  { category: 'Product', title: 'How Customer DNA profiling actually works' },
  { category: 'Engineering', title: 'Building a voice AI that never sounds like a script' },
  { category: 'Sales', title: 'What behavior data predicts buying intent, and what doesn’t' },
];

export default function Blog() {
  const { trackEvent } = useBehaviorTracking();

  useEffect(() => {
    trackEvent('PAGE_VIEW', { page: '/blog' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="blog">
      <Hero eyebrow="Blog" title="Coming" highlight="soon" subtitle="We're writing about what we build. In the meantime, here's what's on the way." showScrollIndicator={false} />

      <section className="blog__section">
        <motion.div className="blog__grid" variants={staggerContainer(0.08)} initial="hidden" whileInView="visible" viewport={viewportOnce}>
          {UPCOMING_TOPICS.map((topic) => (
            <motion.div key={topic.title} className="blog__card" variants={fadeInUp} transition={easeTransition}>
              <span className="blog__card-icon">
                <PenLine size={16} />
              </span>
              <span className="blog__card-category">{topic.category}</span>
              <h3 className="blog__card-title">{topic.title}</h3>
              <span className="blog__card-status">In progress</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <CTA
        title="Have a question we should write about?"
        subtitle="Tell us what you'd want to read, or talk to the AI Sales Consultant right now."
        primaryCta={{ to: '/contact', label: 'Send a suggestion' }}
        secondaryCta={{ to: '/ai-consultant', label: 'Talk to AI' }}
      />
    </div>
  );
}
