import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const EASE_OUT_QUINT = (t) => 1 - Math.pow(1 - t, 5);

/**
 * Counts up from 0 to `value` once it scrolls into view. Renders as plain
 * text (not a motion value bound to the DOM) so the surrounding element can
 * still be any tag needed for typography — this only owns the number.
 */
export default function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, duration = 1.4 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return undefined;

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = (now - start) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      setDisplay(value * EASE_OUT_QUINT(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
