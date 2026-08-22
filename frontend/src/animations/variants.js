// Shared Framer Motion variants — reused across pages instead of every
// component redefining its own fade/slide/stagger transitions inline.

export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
});

// Default transition applied alongside the variants above — smooth,
// slightly decelerated easing consistent with the rest of the design system.
export const easeTransition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] };

export const viewportOnce = { once: true, margin: '-80px' };
