import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const RING_ANIMATION = {
  idle: { scale: 1, opacity: 0.3 },
  listening: { scale: [1, 1.05, 1], opacity: 0.5, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
  thinking: { scale: [1, 1.03, 1], opacity: [0.4, 0.7, 0.4], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } },
  speaking: { scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' } },
};

/**
 * The AI's visual presence during a live voice call — a single animated
 * orb whose motion communicates state at a glance, complementing (not
 * duplicating) VoiceStatusIndicator's text label and Waveform's amplitude
 * bars. Purely decorative/aria-hidden — state is announced via the text
 * indicator elsewhere for accessibility.
 */
export default function AIAvatar({ voiceStatus = 'idle', size = 88 }) {
  const anim = RING_ANIMATION[voiceStatus] ?? RING_ANIMATION.idle;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }} aria-hidden="true">
      <motion.span
        className="absolute inset-0 rounded-full bg-gradient-to-br from-bronze/45 to-champagne/40 blur-md"
        animate={anim}
      />
      <motion.span
        className="absolute inset-[10%] rounded-full border border-bronze/30"
        animate={voiceStatus === 'speaking' ? { rotate: 360 } : { rotate: 0 }}
        transition={voiceStatus === 'speaking' ? { duration: 3, repeat: Infinity, ease: 'linear' } : {}}
      />
      <span className="relative flex h-[62%] w-[62%] items-center justify-center rounded-full bg-gradient-to-br from-bronze to-mocha shadow-[0_0_30px_-6px_rgba(59,130,246,0.6)]">
        <Sparkles size={size * 0.24} className="text-white" />
      </span>
    </div>
  );
}
