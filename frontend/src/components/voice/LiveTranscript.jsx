import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import EmptyState from '../common/EmptyState.jsx';
import { MessageSquare } from 'lucide-react';

export default function LiveTranscript({ transcript }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [transcript]);

  if (transcript.length === 0) {
    return <EmptyState icon={MessageSquare} title="Waiting for the conversation to begin…" />;
  }

  return (
    <div
      ref={containerRef}
      className="flex max-h-[380px] min-h-[180px] flex-col gap-3 overflow-y-auto pr-1.5 scroll-smooth"
    >
      <AnimatePresence initial={false}>
        {transcript.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={clsx('flex', entry.role === 'ai' ? 'justify-start' : 'justify-end')}
          >
            <div
              className={clsx(
                'max-w-[85%] rounded-xl2 px-4 py-2.5 text-sm leading-relaxed shadow-sm',
                entry.role === 'ai'
                  ? 'rounded-tl-sm border border-line bg-surface text-ink'
                  : 'rounded-tr-sm bg-gradient-to-br from-bronze to-coffee text-[#FFFFFF]',
                entry.interim && 'opacity-60'
              )}
            >
              {entry.text}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
