import { motion } from 'framer-motion';
import { Users, TrendingUp, Zap, Calendar } from 'lucide-react';
import { fadeInUp, staggerContainer, easeTransition, viewportOnce } from '../../animations/variants.js';
import './DashboardPreview.css';

const TILES = [
  { icon: Users, label: 'Active visitors', value: '128' },
  { icon: TrendingUp, label: 'Leads generated', value: '842' },
  { icon: Zap, label: 'Qualified leads', value: '316' },
  { icon: Calendar, label: 'Demo requests', value: '54' },
];

const BARS = [38, 62, 45, 78, 55, 90, 68];

const ACTIVITY = ['Lead qualified — Growth plan interest', 'Demo booked for next week', 'Visitor started AI conversation'];

export default function DashboardPreview() {
  return (
    <section className="dashboard-preview">
      <div className="dashboard-preview__header">
        <h2 className="dashboard-preview__title">See it in your dashboard</h2>
        <p className="dashboard-preview__subtitle">
          Every conversation, lead, and behavior signal flows into a real-time dashboard — no spreadsheets, no manual exports.
        </p>
      </div>

      <motion.div
        className="dashboard-preview__frame"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={viewportOnce}
        transition={easeTransition}
      >
        <span className="dashboard-preview__caption">Illustrative preview</span>

        <motion.div className="dashboard-preview__tiles" variants={staggerContainer(0.08)} initial="hidden" whileInView="visible" viewport={viewportOnce}>
          {TILES.map((tile) => (
            <motion.div key={tile.label} className="dashboard-preview__tile" variants={fadeInUp} transition={easeTransition}>
              <tile.icon size={16} className="dashboard-preview__tile-icon" />
              <span className="dashboard-preview__tile-value">{tile.value}</span>
              <span className="dashboard-preview__tile-label">{tile.label}</span>
            </motion.div>
          ))}
        </motion.div>

        <div className="dashboard-preview__body">
          <div className="dashboard-preview__chart">
            {BARS.map((h, i) => (
              <motion.span
                key={i}
                className="dashboard-preview__bar"
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={viewportOnce}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>

          <div className="dashboard-preview__activity">
            <span className="dashboard-preview__activity-label">Recent activity</span>
            <ul className="dashboard-preview__activity-list">
              {ACTIVITY.map((item) => (
                <li key={item}>
                  <span className="dashboard-preview__activity-dot" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
