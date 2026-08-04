import { useReducedMotion } from 'framer-motion';

// Single shared switch for whether ambient/decorative looping animation should play
// (falling leaves, breathing glows, floating icons, gradient shimmer, pulse dots).
// Backed by the OS-level prefers-reduced-motion setting. State-triggered animations
// (hover, tap, entrance) are unaffected — only gate infinite/ambient loops with this.
export function useAmbientMotion(): boolean {
  return !useReducedMotion();
}
