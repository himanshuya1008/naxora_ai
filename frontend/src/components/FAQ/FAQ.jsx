import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { fadeInUp, viewportOnce } from '../../animations/variants.js';
import './FAQ.css';

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <motion.div className="faq-item" variants={fadeInUp}>
      <button className="faq-item__question" onClick={onToggle} aria-expanded={isOpen}>
        {item.question}
        <ChevronDown size={18} className={`faq-item__chevron ${isOpen ? 'faq-item__chevron--open' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="faq-item__answer-wrap"
          >
            <p className="faq-item__answer">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq">
      <div className="faq__header">
        <h2 className="faq__title">Frequently asked questions</h2>
      </div>

      <motion.div
        className="faq__list"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {items.map((item, i) => (
          <FAQItem key={item.question} item={item} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </motion.div>
    </section>
  );
}
