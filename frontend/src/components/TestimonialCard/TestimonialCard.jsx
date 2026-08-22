import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { fadeInUp, easeTransition, viewportOnce } from '../../animations/variants.js';
import './TestimonialCard.css';

export default function TestimonialCard({ quote, role, company, delay = 0 }) {
  return (
    <motion.div
      className="testimonial-card"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ ...easeTransition, delay }}
    >
      <Quote size={20} className="testimonial-card__icon" />
      <p className="testimonial-card__quote">&ldquo;{quote}&rdquo;</p>
      <div className="testimonial-card__attribution">
        <span className="testimonial-card__role">{role}</span>
        <span className="testimonial-card__company">{company}</span>
      </div>
    </motion.div>
  );
}
