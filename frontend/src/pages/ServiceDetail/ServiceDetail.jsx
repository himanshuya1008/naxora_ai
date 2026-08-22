import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Mic, Calendar } from 'lucide-react';
import { getServiceBySlug } from '../../data/services.js';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking.js';
import Button from '../../components/Button/Button.jsx';
import { fadeInUp, easeTransition, viewportOnce } from '../../animations/variants.js';
import './ServiceDetail.css';

export default function ServiceDetail() {
  const { slug } = useParams();
  const { trackEvent } = useBehaviorTracking();
  const service = getServiceBySlug(slug);

  useEffect(() => {
    if (service) trackEvent('SERVICE_VIEW', { page: `/services/${slug}`, label: service.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!service) {
    return (
      <div className="service-detail-empty">
        <p className="service-detail-empty__text">Service not found.</p>
        <Link to="/services" className="service-detail-empty__link">
          <ArrowLeft size={16} />
          Back to Services
        </Link>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="service-detail">
      <motion.div
        className="service-detail__header"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={easeTransition}
      >
        <Link to="/services" className="service-detail__back">
          <ArrowLeft size={16} />
          All services
        </Link>

        <div className="service-detail__title-row">
          <span className="service-detail__icon">
            <Icon size={28} />
          </span>
          <div>
            <h1 className="service-detail__title">{service.name}</h1>
            <p className="service-detail__tagline">{service.tagline}</p>
          </div>
        </div>

        <p className="service-detail__overview">{service.overview}</p>
      </motion.div>

      <div className="service-detail__grid">
        <motion.div
          className="service-detail__card"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={easeTransition}
        >
          <h2 className="service-detail__card-title">Features</h2>
          <ul className="service-detail__list">
            {service.features.map((f) => (
              <li key={f}>
                <CheckCircle2 size={16} className="service-detail__check service-detail__check--emerald" />
                {f}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="service-detail__card"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={{ ...easeTransition, delay: 0.08 }}
        >
          <h2 className="service-detail__card-title">Benefits</h2>
          <ul className="service-detail__list">
            {service.benefits.map((b) => (
              <li key={b}>
                <CheckCircle2 size={16} className="service-detail__check service-detail__check--accent" />
                {b}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="service-detail__grid">
        <motion.div
          className="service-detail__card"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={easeTransition}
        >
          <h2 className="service-detail__card-title">Technologies Used</h2>
          <div className="service-detail__tags">
            {service.technologies.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="service-detail__card"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={{ ...easeTransition, delay: 0.08 }}
        >
          <h2 className="service-detail__card-title">Industries We Serve</h2>
          <div className="service-detail__tags">
            {service.industries.map((i) => (
              <span key={i} className="tag tag--accent">
                {i}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        className="service-detail__closing"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        transition={easeTransition}
      >
        <div className="service-detail__closing-glow" aria-hidden="true" />
        <h2 className="service-detail__closing-title">Ready to talk about {service.name}?</h2>
        <p className="service-detail__closing-subtitle">
          See pricing, book a live demo, or talk to our AI Sales Consultant right now — it already knows you&apos;re interested in{' '}
          {service.name}.
        </p>
        <div className="service-detail__closing-actions">
          <Link to="/pricing">
            <Button variant="secondary">View pricing</Button>
          </Link>
          <Link to={`/ai-consultant?interestedService=${service.slug}`}>
            <Button>
              <Mic size={16} />
              Talk to AI
            </Button>
          </Link>
          <Link to="/book-demo">
            <Button variant="secondary">
              <Calendar size={16} />
              Book a demo
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
