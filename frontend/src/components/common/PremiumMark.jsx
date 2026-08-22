// Bronze/coffee/mocha gradient brand mark used only inside the auth flow —
// kept separate from Logo.jsx (the shared mark in the dark-themed
// Navbar/Sidebar/Footer/Topbar) so the auth redesign can't ripple anywhere
// else in the app.
export default function PremiumMark({ size = 40, showWordmark = true }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="relative flex shrink-0 items-center justify-center"
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.32,
          background: 'linear-gradient(155deg, #3B82F6 0%, #1E40AF 60%, #1E3A8A 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 22px -8px rgba(17,24,39,0.6)',
        }}
      >
        <svg viewBox="0 0 24 24" className="relative" style={{ width: size * 0.5, height: size * 0.5 }} fill="none">
          <path d="M5 19V5l14 14V5" stroke="#FFFFFF" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-[0.95rem] font-semibold tracking-tight" style={{ color: '#111827' }}>
          Nexora <span style={{ color: '#3B82F6' }}>AI</span>
        </span>
      )}
    </span>
  );
}
