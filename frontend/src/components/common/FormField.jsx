export default function FormField({ label, error, children }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-critical">{error}</p>}
    </div>
  );
}
