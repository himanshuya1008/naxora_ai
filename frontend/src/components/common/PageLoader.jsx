import Logo from './Logo.jsx';

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-4 text-ink-faint">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-line border-t-bronze" />
        <Logo showWordmark={false} to={null} size="sm" />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  );
}
