import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { toast } from '../../store/toastStore.js';
import { fadeInUp, staggerContainer, easeTransition, viewportOnce } from '../../animations/variants.js';
import './VideoShowcase.css';

// No video assets exist yet — these are honest, styled placeholders (not
// broken <video> tags pointing at missing files). Once real recordings
// exist, swap each card's onClick for an actual player/modal.
const VIDEOS = [
  { title: 'Product Demo', description: 'A full walkthrough of the platform in under three minutes.' },
  { title: 'Voice AI Demo', description: 'See a live conversation with the AI Sales Consultant.' },
  { title: 'Dashboard Walkthrough', description: 'How Customer DNA and analytics come together for your team.' },
];

export default function VideoShowcase() {
  return (
    <motion.div className="video-showcase" variants={staggerContainer(0.08)} initial="hidden" whileInView="visible" viewport={viewportOnce}>
      {VIDEOS.map((video) => (
        <motion.button
          key={video.title}
          type="button"
          className="video-showcase__card"
          variants={fadeInUp}
          transition={easeTransition}
          onClick={() => toast.info(`${video.title} is coming soon.`)}
        >
          <div className="video-showcase__thumb">
            <span className="video-showcase__play">
              <Play size={20} fill="currentColor" />
            </span>
          </div>
          <div className="video-showcase__body">
            <h3 className="video-showcase__title">{video.title}</h3>
            <p className="video-showcase__description">{video.description}</p>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
