import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeInUp, easeTransition, viewportOnce } from '../../animations/variants.js';
import './CaseStudyCard.css';

export default function CaseStudyCard({ company, industry, result, description, delay = 0 }) {
  return (
    <motion.div
      className="case-study-card"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ ...easeTransition, delay }}
    >
      <span className="case-study-card__industry">{industry}</span>
      <h3 className="case-study-card__result">{result}</h3>
      <p className="case-study-card__company">{company}</p>
      <p className="case-study-card__description">{description}</p>
      <span className="case-study-card__link">
        Read the story <ArrowRight size={14} />
      </span>
    </motion.div>
  );
}
