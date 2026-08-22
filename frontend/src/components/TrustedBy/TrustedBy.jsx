import { motion } from 'framer-motion';
import { fadeIn, viewportOnce } from '../../animations/variants.js';
import './TrustedBy.css';

// Illustrative placeholder names (Contoso/Northwind-style) — no real
// customers exist yet, so these are deliberately generic/fictional
// rather than implying an endorsement that doesn't exist.
const LOGOS = ['Northwind Retail', 'Contoso Cloud', 'Fabrikam Health', 'Globex Analytics', 'Initech Systems'];

export default function TrustedBy() {
  return (
    <motion.section
      className="trusted-by"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      <p className="trusted-by__label">Trusted by teams at</p>
      <div className="trusted-by__row">
        {LOGOS.map((name) => (
          <span key={name} className="trusted-by__logo">
            {name}
          </span>
        ))}
      </div>
    </motion.section>
  );
}
