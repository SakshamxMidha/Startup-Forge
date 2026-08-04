import type { Variants } from 'framer-motion';

// Shared motion language for the "maximal" crimson/katana aesthetic — bigger travel,
// slight scale, bolder stagger than a typical restrained SaaS UI. transform/opacity only.

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

// Bold entrance for cards/sections — bigger rise (44px) + slight scale-up, so it visibly
// "arrives" rather than just fading. Use with `initial="hidden"` and either `animate="show"`
// (mount-triggered) or `whileInView="show"` (scroll-triggered).
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 44, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE_OUT } },
};

// Wider stagger (80-100ms) for cascading groups of the above.
export const revealStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

// Standard viewport config for scroll-triggered reveals: fire once, a bit before the
// element is fully on screen so the motion reads as "arriving", not "already there".
export const revealViewport = { once: true, margin: '-80px' };

// "Reward" reveal for a freshly-generated module result — scale-up-from-below plus a crimson
// glow ring that blooms in and fades, meant to feel like a payoff rather than routine navigation.
export const rewardReveal: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.92, boxShadow: '0 0 0px 0px rgb(var(--glow) / 0)' },
  show: {
    opacity: 1, y: 0, scale: 1,
    boxShadow: ['0 0 70px 8px rgb(var(--glow) / 0.4)', '0 0 0px 0px rgb(var(--glow) / 0)'],
    transition: { duration: 0.6, ease: EASE_OUT, boxShadow: { duration: 1.2, ease: 'easeOut' } },
  },
};
