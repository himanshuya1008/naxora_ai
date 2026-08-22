import { Link } from 'react-router-dom';

const SIZES = {
  sm: { box: 'h-7 w-7', text: 'text-sm', radius: 'rounded-md', gap: 'gap-2' },
  md: { box: 'h-8 w-8', text: 'text-base', radius: 'rounded-lg', gap: 'gap-2.5' },
  lg: { box: 'h-10 w-10', text: 'text-xl', radius: 'rounded-lg', gap: 'gap-3' },
};

/**
 * The single source of truth for the Nexora AI brand mark — used in the
 * marketing Navbar/Footer (plain-CSS pages), the dashboard Sidebar/Topbar,
 * and AuthLayout (Tailwind pages). Tailwind's utility classes are globally
 * compiled across the whole app regardless of which per-page styling system
 * a given page otherwise follows, so one component renders correctly in both.
 */
export default function Logo({ size = 'md', to = '/', showWordmark = true, className = '' }) {
  const s = SIZES[size] ?? SIZES.md;

  const mark = (
    <span
      className={`relative flex ${s.box} shrink-0 items-center justify-center ${s.radius} bg-gradient-to-br from-bronze via-coffee to-mocha shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_22px_-8px_rgba(17,24,39,0.6)]`}
    >
      <svg viewBox="0 0 24 24" className="relative h-[50%] w-[50%]" fill="none">
        <path d="M5 19V5l14 14V5" stroke="#FFFFFF" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );

  const content = (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      {mark}
      {showWordmark && (
        <span className={`font-semibold tracking-tight text-ink ${s.text}`}>
          Nexora <span className="text-bronze">AI</span>
        </span>
      )}
    </span>
  );

  if (!to) return content;
  return (
    <Link to={to} className="inline-flex items-center">
      {content}
    </Link>
  );
}
