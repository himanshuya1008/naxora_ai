import AiFigureArt from '../illustrations/AiFigureArt.jsx';

// Per-page decorative background for the dashboard shells. Deliberately
// reuses the single existing color system (bronze/copper on cream — the
// "one consistent palette across the app" rule) and only varies
// *composition* per page family, so each major section reads as visually
// distinct without introducing new hues. Purely decorative: pointer-events
// none, sits at -z-10 behind <Outlet />, never affects layout.

const GRID_STYLE = {
  backgroundImage: 'linear-gradient(rgba(17, 24, 39, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(17, 24, 39, 0.035) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
};

function Grid({ mask }) {
  return (
    <div
      className="absolute inset-0 opacity-40"
      style={{ ...GRID_STYLE, maskImage: mask, WebkitMaskImage: mask }}
      aria-hidden="true"
    />
  );
}

const TOP_MASK = 'radial-gradient(ellipse 80% 50% at 50% 0%, black 40%, transparent 80%)';

// Settings, Profile, API Keys, Voice Config — the calm baseline treatment.
function DefaultBackdrop() {
  return (
    <>
      <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-bronze/10 blur-3xl" aria-hidden="true" />
      <Grid mask={TOP_MASK} />
    </>
  );
}

// Dashboard landing — the one page that gets the AI figure, tucked into
// the top-right corner behind the stat tiles/charts (never in front of
// real data, just ambient presence like the reference's hero robot).
function HeroFigureBackdrop() {
  return (
    <>
      <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-bronze/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -top-6 right-6 opacity-[0.35] sm:opacity-[0.45] lg:opacity-60">
        <AiFigureArt size={190} />
      </div>
      <Grid mask={TOP_MASK} />
    </>
  );
}

// Live AI conversation — sound rings expanding from top-center, echoing
// AIAvatar's voice-orb language at page scale.
function ConversationBackdrop() {
  return (
    <>
      <div className="absolute -top-16 left-1/4 h-72 w-72 rounded-full bg-bronze/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -top-16 right-1/4 h-72 w-72 rounded-full bg-champagne/25 blur-3xl" aria-hidden="true" />
      <svg className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2" viewBox="0 0 420 420" aria-hidden="true">
        {[70, 130, 190].map((r, i) => (
          <circle key={r} cx="210" cy="0" r={r} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 8" className="text-bronze/15" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </svg>
      <Grid mask={TOP_MASK} />
    </>
  );
}

// Analytics, Revenue, Sales Funnel — an ascending diagonal trail, evoking
// growth without duplicating EmptyState's chart glyph.
function ChartBackdrop() {
  return (
    <>
      <div className="absolute -bottom-20 -left-10 h-80 w-80 rounded-full bg-bronze/08 blur-3xl" aria-hidden="true" />
      <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-bronze/10 blur-3xl" aria-hidden="true" />
      <svg className="absolute bottom-0 left-0 h-[280px] w-full" viewBox="0 0 800 280" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 0 260 L 160 210 L 320 230 L 480 140 L 640 110 L 800 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-bronze/10" />
      </svg>
      <Grid mask={TOP_MASK} />
    </>
  );
}

// Customer DNA — concentric fingerprint-like rings top-center.
function OrbitBackdrop() {
  return (
    <>
      <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-bronze/10 blur-3xl" aria-hidden="true" />
      <svg className="absolute left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2" viewBox="0 0 360 360" aria-hidden="true">
        {[40, 70, 100, 130].map((r) => (
          <circle key={r} cx="180" cy="20" r={r} fill="none" stroke="currentColor" strokeWidth="1" className="text-bronze/10" />
        ))}
      </svg>
      <Grid mask={TOP_MASK} />
    </>
  );
}

// Reports — softly offset document-stack rectangles, top-right.
function StackBackdrop() {
  return (
    <>
      <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-bronze/10 blur-3xl" aria-hidden="true" />
      <svg className="absolute -right-10 top-6 h-64 w-64" viewBox="0 0 200 200" aria-hidden="true">
        <rect x="30" y="20" width="120" height="150" rx="8" fill="none" stroke="currentColor" strokeWidth="1" className="text-bronze/10" transform="rotate(-6 90 95)" />
        <rect x="30" y="20" width="120" height="150" rx="8" fill="none" stroke="currentColor" strokeWidth="1" className="text-bronze/14" transform="rotate(4 90 95)" />
        <rect x="30" y="20" width="120" height="150" rx="8" fill="none" stroke="currentColor" strokeWidth="1" className="text-bronze/20" />
      </svg>
      <Grid mask={TOP_MASK} />
    </>
  );
}

// Leads, Customers — a loose contact mesh, top-right.
function NetworkBackdrop() {
  const nodes = [
    [40, 30],
    [120, 15],
    [150, 70],
    [90, 100],
    [20, 80],
  ];
  return (
    <>
      <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-bronze/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-16 left-0 h-56 w-56 rounded-full bg-champagne/20 blur-3xl" aria-hidden="true" />
      <svg className="absolute -right-4 top-4 h-48 w-48" viewBox="0 0 170 130" aria-hidden="true">
        {nodes.map(([x, y], i) =>
          nodes.slice(i + 1).map(([x2, y2], j) => (
            <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" className="text-bronze/08" />
          ))
        )}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" className="fill-bronze/20" />
        ))}
      </svg>
      <Grid mask={TOP_MASK} />
    </>
  );
}

const SCENES = {
  default: DefaultBackdrop,
  heroFigure: HeroFigureBackdrop,
  conversation: ConversationBackdrop,
  chart: ChartBackdrop,
  orbit: OrbitBackdrop,
  stack: StackBackdrop,
  network: NetworkBackdrop,
};

export default function PageBackdrop({ variant = 'default' }) {
  const Scene = SCENES[variant] ?? DefaultBackdrop;
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Scene />
    </div>
  );
}
