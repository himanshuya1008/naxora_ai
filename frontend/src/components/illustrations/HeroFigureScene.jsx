import { Mic, TrendingUp, Users, Target, Fingerprint } from 'lucide-react';
import LiveAiOrb from './LiveAiOrb.jsx';

function MetricChip({ icon: Icon, label, value, className }) {
  return (
    <div className={`animate-float absolute flex items-center gap-2.5 rounded-xl2 border border-line bg-surface px-3.5 py-2.5 shadow-hover ${className}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bronze/10 text-bronze">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="leading-tight">
        <p className="text-[0.65rem] font-medium text-ink-faint">{label}</p>
        <p className="text-xs font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

// Home hero's decorative visual — a real 3D AI core (see AiCoreScene.jsx,
// mounted via LiveAiOrb.jsx) with floating glass metric chips around it.
// Chips are clearly illustrative (no claim to be live data), same
// convention this page already uses for its case studies/testimonials.
export default function HeroFigureScene() {
  return (
    <div className="relative" style={{ width: 'clamp(280px, 26vw, 420px)', height: 'clamp(310px, 29vw, 460px)' }}>
      <div className="absolute inset-0">
        <LiveAiOrb />
      </div>

      <MetricChip icon={Target} label="Lead score" value="92 · High intent" className="left-0 top-4 [animation-delay:0.2s]" />
      <MetricChip icon={Users} label="Visitors" value="1,248" className="right-0 top-24 [animation-delay:0.8s]" />
      <MetricChip icon={TrendingUp} label="Conversion" value="18.4%" className="left-2 bottom-24 [animation-delay:1.4s]" />
      <MetricChip icon={Fingerprint} label="Customer DNA" value="Ready" className="right-2 bottom-6 [animation-delay:0.5s]" />
      <MetricChip icon={Mic} label="Voice call" value="Connected" className="left-1/2 top-0 -translate-x-1/2 [animation-delay:1.1s]" />
    </div>
  );
}
