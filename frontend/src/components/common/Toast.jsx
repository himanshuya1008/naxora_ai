import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore.js';

const ICON = { success: CheckCircle2, error: AlertTriangle, info: Info };
const BORDER_CLASS = {
  success: 'border-success/25',
  error: 'border-critical/25',
  info: 'border-info/25',
};
const ICON_CLASS = {
  success: 'text-success',
  error: 'text-critical',
  info: 'text-info',
};

export default function Toast({ id, type, message }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const Icon = ICON[type] ?? Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      role="status"
      className={`flex w-full items-start gap-3 rounded-xl2 border bg-surface-raised p-4 shadow-overlay ${BORDER_CLASS[type] ?? BORDER_CLASS.info}`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${ICON_CLASS[type] ?? ICON_CLASS.info}`} />
      <p className="flex-1 text-sm leading-relaxed text-ink">{message}</p>
      <button
        onClick={() => dismiss(id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-0.5 text-ink-faint transition-colors hover:bg-champagne/15 hover:text-ink-2"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
