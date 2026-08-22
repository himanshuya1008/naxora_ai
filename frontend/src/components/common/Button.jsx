import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

export default function Button({ variant = 'primary', loading = false, disabled, className, children, ...props }) {
  return (
    <button className={clsx(VARIANT_CLASS[variant], className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
