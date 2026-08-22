// Original artwork (no external assets/copied illustrations) — a small
// family of abstract "AI system" scenes sharing one visual language (soft
// glow blob, hairline bronze strokes, pulsing nodes) but each built from a
// distinct composition so an empty conversations list doesn't look like an
// empty leads list. EmptyState.jsx picks one of these by the Lucide icon
// the caller already passes it — no call-site changes needed.

const WRAPPER = 'relative flex h-28 w-28 items-center justify-center';
const GLOW = 'absolute inset-0 animate-pulse-slow rounded-full bg-bronze/15 blur-xl';
const BADGE = 'relative flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-bronze shadow-ambient';

function IconBadge({ icon: Icon }) {
  if (!Icon) return null;
  return (
    <span className={BADGE}>
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </span>
  );
}

// Default / fallback — a center ring with four orbiting, pulsing nodes.
export function OrbitScene({ icon: Icon }) {
  const nodes = [
    [56, 10],
    [102, 56],
    [56, 102],
    [10, 56],
  ];
  return (
    <div className={WRAPPER}>
      <span className={GLOW} />
      <svg viewBox="0 0 112 112" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="56" cy="56" r="34" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" className="text-line-strong" />
        {nodes.map(([x, y], i) => (
          <line key={i} x1="56" y1="56" x2={x} y2={y} stroke="currentColor" strokeWidth="1" className="text-bronze/25" />
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" className="fill-bronze/50" style={{ animation: `nexora-node-pulse 3.2s ease-in-out ${i * 0.4}s infinite` }} />
        ))}
      </svg>
      <IconBadge icon={Icon} />
    </div>
  );
}

// Voice / conversations — sonar ripples + a flanking equalizer, evoking a
// live mic rather than the generic orbit.
export function WaveformScene({ icon: Icon }) {
  const bars = [
    { x: 6, h: 14 },
    { x: 16, h: 24 },
    { x: 26, h: 16 },
    { x: 86, h: 16 },
    { x: 96, h: 26 },
    { x: 106, h: 12 },
  ];
  return (
    <div className={WRAPPER}>
      <span className={GLOW} />
      <svg viewBox="0 0 112 112" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx="56"
            cy="56"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 6"
            className="text-bronze/30"
            style={{ transformOrigin: '56px 56px', animation: `nexora-ripple 2.8s ease-out ${i * 0.7}s infinite` }}
          />
        ))}
        {bars.map(({ x, h }, i) => (
          <rect
            key={i}
            x={x}
            y={56 - h / 2}
            width="4"
            height={h}
            rx="2"
            className="fill-bronze/40"
            style={{ transformOrigin: `${x + 2}px 56px`, animation: `nexora-bar-pulse 2.2s ease-in-out ${i * 0.18}s infinite` }}
          />
        ))}
      </svg>
      <IconBadge icon={Icon} />
    </div>
  );
}

// Leads / customers / people — an asymmetric node graph (mesh, not a
// wheel), reading as "network of contacts" rather than orbiting data.
export function NetworkScene({ icon: Icon }) {
  const nodes = [
    [24, 30],
    [88, 24],
    [96, 68],
    [60, 98],
    [16, 78],
  ];
  const meshEdges = [
    [0, 1],
    [2, 3],
    [4, 0],
  ];
  return (
    <div className={WRAPPER}>
      <span className={GLOW} />
      <svg viewBox="0 0 112 112" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {nodes.map(([x, y], i) => (
          <line key={`c${i}`} x1="56" y1="56" x2={x} y2={y} stroke="currentColor" strokeWidth="1" className="text-bronze/20" />
        ))}
        {meshEdges.map(([a, b], i) => (
          <line
            key={`m${i}`}
            x1={nodes[a][0]}
            y1={nodes[a][1]}
            x2={nodes[b][0]}
            y2={nodes[b][1]}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 4"
            className="text-line-strong"
          />
        ))}
        {nodes.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 2 === 0 ? 3.5 : 2.5}
            className="fill-bronze/50"
            style={{ animation: `nexora-node-pulse 3.4s ease-in-out ${i * 0.3}s infinite` }}
          />
        ))}
      </svg>
      <IconBadge icon={Icon} />
    </div>
  );
}

// Analytics / reports / revenue — an ascending trend line with glowing
// vertices, reading as "chart" rather than a network or a ripple.
export function PulseScene({ icon: Icon }) {
  const points = [
    [12, 88],
    [32, 72],
    [48, 78],
    [66, 50],
    [82, 42],
    [100, 22],
  ];
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const areaPath = `${linePath} L 100 104 L 12 104 Z`;
  return (
    <div className={WRAPPER}>
      <span className={GLOW} />
      <svg viewBox="0 0 112 112" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d={areaPath} className="fill-bronze/[0.06]" />
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="text-bronze/35" />
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2.5"
            className="fill-bronze/55"
            style={{ animation: `nexora-node-pulse 3s ease-in-out ${i * 0.22}s infinite` }}
          />
        ))}
      </svg>
      <IconBadge icon={Icon} />
    </div>
  );
}
