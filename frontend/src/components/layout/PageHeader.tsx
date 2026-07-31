import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Katana } from '@/components/fx/Katana';

export function PageHeader({ title, subtitle, action, showKatana }: {
  title: string; subtitle?: string; action?: ReactNode; showKatana?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
    >
      {/* decorative glow + katana, clipped to this box so it can never cause page overflow */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none select-none">
        <div className="absolute -top-16 -left-10 w-72 h-72 rounded-full bg-crimson/15 blur-3xl animate-breathe" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-crimson/25 to-transparent" />
        {showKatana && (
          <Katana
            animate
            glow
            className="hidden sm:block absolute -right-6 top-1/2 -translate-y-1/2 w-72 h-16 opacity-50"
          />
        )}
      </div>
      <div className="relative py-1">
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-fg-muted mt-1">{subtitle}</p>}
      </div>
      <div className="relative">{action}</div>
    </motion.div>
  );
}
