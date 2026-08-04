import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAmbientMotion } from '@/hooks/useAmbientMotion';

export default function NotFound() {
  const ambient = useAmbientMotion();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        animate={ambient ? { rotate: [0, 8, -8, 0] } : undefined}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-3xl bg-crimson/10 text-crimson flex items-center justify-center mb-6"
      >
        <Compass className="w-10 h-10" />
      </motion.div>
      <h1 className="text-6xl font-extrabold gradient-text mb-3">404</h1>
      <p className="text-fg-muted mb-8">This page wandered off the roadmap.</p>
      <Link to="/"><Button variant="gradient">Take me home</Button></Link>
    </div>
  );
}
