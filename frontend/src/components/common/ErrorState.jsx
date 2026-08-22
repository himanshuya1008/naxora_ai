import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button.jsx';

/**
 * Full-card-takeover error state — same shape/spacing as EmptyState so the
 * two read as siblings in the same visual language, but critical-tinted so
 * a failed fetch never gets mistaken for "there's just no data yet".
 */
export default function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-critical/25 bg-critical/[0.03] px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-critical/10 text-critical">
        <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div>
        <p className="font-serif text-base font-medium text-ink">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-ink-faint">
            {typeof description === 'string' ? description : description?.message || JSON.stringify(description)}
          </p>
        )}
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
