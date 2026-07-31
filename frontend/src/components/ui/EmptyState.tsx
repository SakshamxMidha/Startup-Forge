import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Katana } from '@/components/fx/Katana';

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center justify-center text-center py-16 px-6 overflow-hidden"
    >
      <Katana
        animate
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-16 opacity-[0.07] pointer-events-none select-none"
      />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-16 h-16 rounded-2xl bg-crimson/10 text-crimson flex items-center justify-center mb-5 shadow-glow"
      >
        {icon}
      </motion.div>
      <h3 className="relative text-lg font-semibold mb-1.5">{title}</h3>
      <p className="relative text-sm text-fg-muted max-w-sm mb-6">{description}</p>
      <div className="relative">{action}</div>
    </motion.div>
  );
}
