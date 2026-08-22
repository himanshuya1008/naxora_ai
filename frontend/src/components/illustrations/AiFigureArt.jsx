// Original artwork — an abstract, geometric "AI figure" bust (helmet-like
// head, visor band, paneled shoulders, glowing chest core) built entirely
// from hairline SVG strokes in the app's own palette. This is the closest
// honest substitute for a photorealistic robot render: no traced/copied
// reference, no raster asset, just shapes — figurative enough to read as
// "an AI presence" without pretending to be a photo. `tone="dark"` is for
// placing it on the auth brand panel's dark background; default `"light"`
// is for the cream app background (Dashboard).
// Fill/stroke opacities are parametrized per tone, not shared constants —
// the same 0.06 fill that reads as an elegant hairline on the light cream
// background is nearly invisible against the dark auth-panel gradient, so
// `dark` gets meaningfully stronger values, not just a different hue.
const TONE = {
  light: {
    stroke: 'text-bronze/35',
    strokeSoft: 'text-bronze/18',
    fill: 'fill-bronze/10',
    glow: 'bg-bronze/20',
    core: 'from-bronze to-mocha',
    coreGlow: 'rgba(59,130,246,0.55)',
    bodyFillOpacity: 0.07,
    partFillOpacity: 0.09,
    visorFillOpacity: 0.18,
    strokeWidth: 1.25,
  },
  dark: {
    stroke: 'text-champagne/80',
    strokeSoft: 'text-champagne/45',
    fill: 'fill-champagne/20',
    glow: 'bg-champagne/30',
    core: 'from-champagne to-bronze',
    coreGlow: 'rgba(96,165,250,0.75)',
    bodyFillOpacity: 0.18,
    partFillOpacity: 0.22,
    visorFillOpacity: 0.4,
    strokeWidth: 1.5,
  },
};

export default function AiFigureArt({ tone = 'light', size = 220 }) {
  const t = TONE[tone] ?? TONE.light;
  const height = Math.round(size * (300 / 220));

  return (
    <div className="animate-float" style={{ width: size, height }} aria-hidden="true">
      <div className="relative h-full w-full">
        <span className={`absolute inset-x-[8%] bottom-[6%] top-[30%] rounded-full ${t.glow} blur-3xl`} />

        <svg viewBox="0 0 220 300" className="relative h-full w-full">
          {/* shoulders / torso panel */}
          <path
            d="M52 262 C48 190 60 130 92 106 L128 106 C160 130 172 190 168 262 C168 278 138 288 110 288 C82 288 52 278 52 262 Z"
            className={`${t.fill} ${t.stroke}`}
            fill="currentColor"
            fillOpacity={t.bodyFillOpacity}
            stroke="currentColor"
            strokeWidth={t.strokeWidth}
          />
          {/* panel seams */}
          <path d="M76 150 L76 230" stroke="currentColor" strokeWidth="1" className={t.strokeSoft} />
          <path d="M144 150 L144 230" stroke="currentColor" strokeWidth="1" className={t.strokeSoft} />
          <path d="M60 200 L160 200" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" className={t.strokeSoft} />

          {/* neck */}
          <rect x="98" y="90" width="24" height="20" rx="5" className={t.stroke} fill="currentColor" fillOpacity={t.partFillOpacity} stroke="currentColor" strokeWidth={t.strokeWidth} />

          {/* head */}
          <rect x="74" y="14" width="72" height="80" rx="32" className={t.stroke} fill="currentColor" fillOpacity={t.bodyFillOpacity} stroke="currentColor" strokeWidth={t.strokeWidth} />
          {/* visor */}
          <rect x="86" y="48" width="48" height="15" rx="7.5" className={t.stroke} fill="currentColor" fillOpacity={t.visorFillOpacity} stroke="currentColor" strokeWidth="1" />

          {/* chest core, echoing AIAvatar's glow language */}
          <circle cx="110" cy="182" r="17" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 5" className={t.stroke} />
        </svg>

        <span
          className={`absolute left-1/2 top-[60.5%] flex h-[11%] w-[11%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br ${t.core}`}
          style={{ boxShadow: `0 0 26px -4px ${t.coreGlow}` }}
        />
      </div>
    </div>
  );
}
