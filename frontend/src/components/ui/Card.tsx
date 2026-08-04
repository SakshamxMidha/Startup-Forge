import { ReactNode, useRef, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAmbientMotion } from '@/hooks/useAmbientMotion';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover, onClick }: Props) {
  const ambient = useAmbientMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Pointer-tracked tilt — transform-only, driven by motion values so it never touches layout.
  // Skipped under reduced-motion (kept: the gentler lift + glow bloom below).
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 300, damping: 26 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 300, damping: 26 });

  const tiltEnabled = hover && ambient;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const handleMouseLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltEnabled ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      whileHover={hover ? {
        y: -8,
        scale: 1.015,
        boxShadow: '0 30px 64px -18px rgb(var(--glow) / 0.5), 0 14px 36px -14px rgb(0 0 0 / 0.4)',
      } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`bg-bg-elev border border-border-soft rounded-2xl shadow-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
