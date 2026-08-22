import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Calendar } from 'lucide-react';
import Button from '../Button/Button.jsx';
import { fadeInUp, easeTransition, viewportOnce } from '../../animations/variants.js';
import './PricingCard.css';

export default function PricingCard({ name, price, period, description, features, highlighted, ctaTo = '/book-demo', delay = 0 }) {
  return (
    <motion.div
      className={`pricing-card ${highlighted ? 'pricing-card--highlighted' : ''}`}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ ...easeTransition, delay }}
    >
      {highlighted && <span className="pricing-card__badge">Most popular</span>}

      <h3 className="pricing-card__name">{name}</h3>
      <p className="pricing-card__description">{description}</p>

      <div className="pricing-card__price-row">
        <span className="pricing-card__price">{price}</span>
        {period && <span className="pricing-card__period">{period}</span>}
      </div>

      <ul className="pricing-card__features">
        {features.map((f) => (
          <li key={f}>
            <Check size={16} className="pricing-card__check" />
            {f}
          </li>
        ))}
      </ul>

      <Link to={ctaTo} className="pricing-card__cta">
        <Button variant={highlighted ? 'primary' : 'secondary'} className="pricing-card__btn">
          <Calendar size={15} />
          Book a demo
        </Button>
      </Link>
    </motion.div>
  );
}
