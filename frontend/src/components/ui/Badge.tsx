import { ReactNode } from 'react';

type Tone = 'crimson' | 'success' | 'warning' | 'danger' | 'neutral' | 'gold';

const tones: Record<Tone, string> = {
  crimson: 'bg-crimson/12 text-crimson border-crimson/25',
  success: 'bg-success/12 text-success border-success/25',
  warning: 'bg-warning/12 text-warning border-warning/25',
  danger: 'bg-danger/12 text-danger border-danger/25',
  gold: 'bg-gold/12 text-gold border-gold/25',
  neutral: 'bg-bg-soft text-fg-muted border-border',
};

export function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
