import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Live MM:SS call timer. Ticks with its own local interval/state rather than
 * writing to the shared store every second — `callStartedAt` itself is set
 * once (see conversationStore.js) and never updates, so no other subscriber
 * re-renders because this component is counting.
 */
export default function CallDuration({ startedAt }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) return null;

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium tabular-nums text-ink-faint">
      <Clock size={12} />
      {formatDuration(now - startedAt)}
    </span>
  );
}
