import { useEffect, useRef } from 'react';

/**
 * A soft radial light that follows the pointer, scoped to whatever section
 * wraps it (absolutely positioned, clipped by the parent's overflow-hidden).
 * Skipped entirely on touch devices (pointer: coarse) — there's no cursor to
 * glow, and it would just be dead weight. Driven by direct DOM style writes
 * on a ref rather than React state, so mouse movement never triggers a
 * re-render — the same pattern already used for the voice call waveform.
 */
export default function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;

    const el = ref.current;
    if (!el) return undefined;

    let frame = null;
    const handleMove = (e) => {
      const parent = el.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.transform = `translate(${x - 220}px, ${y - 220}px)`;
        el.style.opacity = '1';
      });
    };

    const handleLeave = () => {
      el.style.opacity = '0';
    };

    const parent = el.parentElement;
    parent?.addEventListener('mousemove', handleMove);
    parent?.addEventListener('mouseleave', handleLeave);

    return () => {
      parent?.removeEventListener('mousemove', handleMove);
      parent?.removeEventListener('mouseleave', handleLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 h-[440px] w-[440px] rounded-full opacity-0 transition-opacity duration-500"
      style={{
        background: 'radial-gradient(circle, rgba(37,99,235,0.14), rgba(96,165,250,0.06) 45%, transparent 70%)',
        willChange: 'transform',
      }}
    />
  );
}
