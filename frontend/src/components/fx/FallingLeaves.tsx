import { useEffect, useState, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAmbientMotion } from '@/hooks/useAmbientMotion';

interface Leaf {
  id: number; left: number; size: number; color: string;
  drift: number; spin: number; duration: number; delay: number;
}

// Dark mode: bright crimson/ember/gold pop against the near-black background.
const COLORS_DARK = ['225 29 46', '158 18 34', '230 110 96', '255 68 82'];
// Light mode: the same hues, deepened so they still have enough contrast against the cream background.
const COLORS_LIGHT = ['176 20 34', '110 14 24', '176 66 54', '190 26 40'];

// Ambient falling maple leaves. `density` controls how many are on screen.
export function FallingLeaves({ density = 18, className = '' }: { density?: number; className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const ambient = useAmbientMotion();
  useEffect(() => setMounted(true), []);

  const colors = theme === 'light' ? COLORS_LIGHT : COLORS_DARK;

  const leaves = useMemo<Leaf[]>(() =>
    Array.from({ length: density }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 8 + Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      drift: Math.random() * 240 - 120,
      spin: Math.random() * 720 - 360,
      duration: 8 + Math.random() * 9,
      delay: Math.random() * 12,
    })), [density, colors]);

  if (!mounted || !ambient) return null;

  return (
    <div className={`pointer-events-none fixed inset-0 overflow-hidden z-0 ${className}`} aria-hidden>
      {leaves.map((l) => (
        <div
          key={l.id}
          style={{
            position: 'absolute', top: '-40px', left: `${l.left}%`,
            // @ts-expect-error CSS custom props
            '--drift': `${l.drift}px`, '--spin': `${l.spin}deg`,
            animation: `leaf-fall ${l.duration}s linear ${l.delay}s infinite`,
          }}
        >
          <svg width={l.size} height={l.size} viewBox="0 0 24 24" fill={`rgb(${l.color})`}
            style={{ filter: `drop-shadow(0 0 4px rgba(${l.color.split(' ').join(',')},.5))`, opacity: 0.85 }}>
            <path d="M12 2c.5 2 1.2 3.2 2.6 4.2 1-.4 2-.5 2-.5s-.3 1.2-.9 2c1.3.6 2.3.5 2.3.5s-.7 1.1-1.8 1.6c1 .9 2.2 1.1 2.2 1.1s-1.1 1-2.5 1.1c.5 1.2 1.5 1.9 1.5 1.9s-1.6.3-2.9-.4c-.1 1.4.4 2.8.4 2.8s-1.4-.6-2.1-1.9c-.2.1-.4.1-.4.1s-.2 0-.4-.1c-.7 1.3-2.1 1.9-2.1 1.9s.5-1.4.4-2.8c-1.3.7-2.9.4-2.9.4s1-.7 1.5-1.9C6.1 13.6 5 12.6 5 12.6s1.2-.2 2.2-1.1C6.1 11 5.4 9.9 5.4 9.9s1-.1 2.3-.5c-.6-.8-.9-2-.9-2s1 .1 2 .5C10.2 6.9 10.9 5.7 11.4 3.7c.2-.8.6-1.7.6-1.7z"/>
          </svg>
        </div>
      ))}
      <style>{`@keyframes leaf-fall{0%{transform:translateY(-40px) translateX(0) rotate(0);opacity:0}10%{opacity:.85}90%{opacity:.85}100%{transform:translateY(105vh) translateX(var(--drift)) rotate(var(--spin));opacity:0}}`}</style>
    </div>
  );
}
