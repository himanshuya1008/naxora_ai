import { AlertTriangle } from 'lucide-react';

export default function ErrorBanner({ message }) {
  if (!message) return null;

  let text = '';
  if (typeof message === 'string') {
    text = message;
  } else if (message instanceof Error) {
    text = message.message;
  } else if (typeof message === 'object' && message !== null) {
    text = message.message || message.error || message.errorMsg || JSON.stringify(message);
  } else {
    text = String(message);
  }

  if (!text || text === '{}') return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-critical/25 bg-critical/[0.06] px-4 py-3 text-sm text-critical">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
