import './FormField.css';

export default function FormField({ label, error, children }) {
  return (
    <div className="form-field">
      <label className="form-field__label">{label}</label>
      {children}
      {error && <p className="form-field__error">{error}</p>}
    </div>
  );
}
