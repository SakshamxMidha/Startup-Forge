import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover, onClick }: Props) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, boxShadow: '0 16px 48px -16px rgb(0 0 0 / 0.3)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`bg-bg-elev border border-border-soft rounded-2xl shadow-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
