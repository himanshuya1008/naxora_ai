import { AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../store/toastStore.js';
import Toast from './Toast.jsx';

/**
 * Mounted once at the app root (see App.jsx). Fixed bottom-center on mobile
 * (thumb-reachable, doesn't collide with a mobile nav bar) and top-right on
 * larger screens, matching where most SaaS dashboards surface toasts.
 */
export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:top-4 sm:bottom-auto sm:right-4 sm:items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full sm:w-96">
            <Toast {...t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
