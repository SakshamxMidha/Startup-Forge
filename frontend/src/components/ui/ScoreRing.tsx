import { motion } from 'framer-motion';

interface Props {
  score: number; // 0-10
  label: string;
  size?: number;
}

export function ScoreRing({ score, label, size = 96 }: Props) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(10, score)) / 10;
  const color = pct >= 0.7 ? 'rgb(var(--success))' : pct >= 0.4 ? 'rgb(var(--warning))' : 'rgb(var(--danger))';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--border))" strokeWidth="7" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>{score.toFixed(1)}</span>
        </div>
      </div>
      <span className="text-xs text-fg-muted font-medium">{label}</span>
    </div>
  );
}
