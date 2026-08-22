import { useEffect, useRef } from 'react';
import { useConversationStore } from '../../store/conversationStore.js';

const BAR_COUNT = 32;
// Per-bar randomized responsiveness so bars don't move in perfect lockstep —
// reads as a real waveform instead of a single pulsing block.
const BAR_PHASES = Array.from({ length: BAR_COUNT }, () => 0.6 + Math.random() * 0.4);

/**
 * Audio-reactive waveform driven directly by the mic/AI amplitude events —
 * intentionally bypasses React state (see useVoiceCall) since level data
 * arrives at animation-frame rate and would otherwise force a re-render
 * ~60 times/sec for the whole conversation page.
 */
export default function Waveform({ voiceSocketRef }) {
  const barRefs = useRef([]);
  const levelsRef = useRef({ mic: 0, ai: 0 });
  const status = useConversationStore((s) => s.status);
  const aiSpeaking = useConversationStore((s) => s.aiSpeaking);

  useEffect(() => {
    const voiceSocket = voiceSocketRef.current;
    if (!voiceSocket) return undefined;

    const offMic = voiceSocket.on('mic-level', (level) => {
      levelsRef.current.mic = level;
    });
    const offAi = voiceSocket.on('ai-level', (level) => {
      levelsRef.current.ai = level;
    });

    return () => {
      offMic();
      offAi();
    };
  }, [voiceSocketRef, status]);

  useEffect(() => {
    let frame;
    // Exponential smoothing toward the raw amplitude each frame, instead of
    // snapping straight to it — raw mic/ai-level events arrive in bursts and
    // jump around, so rendering them directly reads as jittery/twitchy. This
    // keeps the same responsiveness but with a fluid, smoothed motion.
    let smoothedAmplitude = 0;
    const SMOOTHING = 0.25;
    const animate = () => {
      const targetAmplitude = Math.max(levelsRef.current.mic, levelsRef.current.ai);
      smoothedAmplitude += (targetAmplitude - smoothedAmplitude) * SMOOTHING;
      barRefs.current.forEach((el, i) => {
        if (!el) return;
        const phase = BAR_PHASES[i];
        const wobble = Math.sin(Date.now() / 180 + i) * 0.15;
        const height = status === 'active' ? 8 + Math.max(0, smoothedAmplitude * phase + wobble) * 72 : 8;
        el.style.height = `${height}%`;
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [status]);

  return (
    <div className="flex h-40 items-center justify-center gap-1">
      {BAR_PHASES.map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            barRefs.current[i] = el;
          }}
          className={`w-1.5 rounded-full transition-colors duration-300 ${
            aiSpeaking ? 'bg-gradient-to-t from-coffee to-bronze' : 'bg-gradient-to-t from-bronze to-champagne'
          }`}
          style={{ height: '8%' }}
        />
      ))}
    </div>
  );
}
