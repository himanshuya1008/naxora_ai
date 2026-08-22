import { Loader2 } from 'lucide-react';
import './Button.css';

const VARIANT_CLASS = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  ghost: 'btn btn--ghost',
};

export default function Button({ variant = 'primary', loading = false, disabled, className, children, ...props }) {
  const classes = [VARIANT_CLASS[variant], className].filter(Boolean).join(' ');
  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="btn__spinner" size={16} />}
      {children}
    </button>
  );
}
