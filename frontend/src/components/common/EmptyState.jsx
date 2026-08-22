import { Mic, UserPlus, Building2, Users, FileText, Wallet } from 'lucide-react';
import { OrbitScene, WaveformScene, NetworkScene, PulseScene } from '../illustrations/EmptyStateArt.jsx';

// Which illustration a given empty state gets is derived from the Lucide
// icon its caller already passes in — every one of this component's ~18
// call sites across the app picks up a context-appropriate scene with zero
// call-site changes. Unmapped/absent icons fall back to OrbitScene.
const SCENE_BY_ICON = new Map([
  [Mic, WaveformScene],
  [UserPlus, NetworkScene],
  [Building2, NetworkScene],
  [Users, NetworkScene],
  [FileText, PulseScene],
  [Wallet, PulseScene],
]);

export default function EmptyState({ icon: Icon, title, description, action }) {
  const Scene = SCENE_BY_ICON.get(Icon) ?? OrbitScene;

  return (
    <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-xl2 border border-dashed border-line bg-bg-alt/40 px-6 py-16 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(17, 24, 39, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17, 24, 39, 0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 75%)',
        }}
      />

      <Scene icon={Icon} />

      <div className="relative">
        <p className="font-serif text-base font-medium text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-faint">{description}</p>}
      </div>
      {action && <div className="relative">{action}</div>}
    </div>
  );
}
