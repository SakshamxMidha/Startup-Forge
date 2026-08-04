import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useInView } from 'framer-motion';

export function AnimatedCounter({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  // Slightly underdamped (rather than the original overdamped spring) so the count-up has a
  // small energetic pop at the end instead of a flat linear tick-up — kept subtle since these
  // KPI values are often single digits, where a big overshoot would just look like a glitch.
  const spring = useSpring(mv, { stiffness: 110, damping: 18 });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v).toLocaleString();
    });
  }, [spring]);

  return <span ref={ref} className={className}>0</span>;
}
