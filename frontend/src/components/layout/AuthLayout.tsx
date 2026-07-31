import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, MessagesSquare } from 'lucide-react';
import { FallingLeaves } from '@/components/fx/FallingLeaves';
import { Katana } from '@/components/fx/Katana';

const brandFeatures = [
  { icon: Brain, text: 'Instant scoring & validation' },
  { icon: Zap, text: 'Investor pitch decks in seconds' },
  { icon: MessagesSquare, text: 'AI sensei grounded in your data' },
];

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_0.9fr]">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-14 overflow-hidden bg-bg-soft">
        <div className="absolute w-[520px] h-[520px] rounded-full animate-breathe top-[22%] -left-[12%] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgb(var(--ember)/.25), rgb(var(--crimson)/.08) 50%, transparent 70%)', filter: 'blur(24px)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: 'linear-gradient(rgb(var(--crimson)/.06) 1px,transparent 1px),linear-gradient(90deg,rgb(var(--crimson)/.06) 1px,transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 100% 80% at 30% 50%, black, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 100% 80% at 30% 50%, black, transparent 80%)',
          }} />
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[12%] -left-[6%] w-[120%] opacity-50 pointer-events-none">
          <Katana className="w-full" />
        </motion.div>

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-crimson to-ember flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-semibold text-lg">StartupForge AI</span>
        </Link>

        <div className="relative z-10">
          <div className="mono text-xs font-semibold text-gold tracking-[0.35em] mb-3">PRECISION FORGED</div>
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
            Your idea<br />deserves a<br /><span className="gradient-text">master's edge.</span>
          </h1>
          <div className="mt-8 space-y-4">
            {brandFeatures.map(({ icon: Icon, text }, i) => (
              <motion.div key={text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3 text-fg-muted">
                <div className="w-9 h-9 rounded-xl bg-crimson/14 text-crimson-bright flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                {text}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mono text-[11px] text-fg-subtle flex gap-6">
          <span>6 MODULES</span><span>RAG-POWERED</span><span>ZERO SETUP</span>
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex items-center justify-center p-6 sm:p-10 bg-bg overflow-hidden">
        <FallingLeaves density={8} />
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-sm"
        >
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-crimson to-ember flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-xl">StartupForge AI</span>
          </Link>
          <div className="mb-7">
            <h1 className="font-display text-2xl sm:text-3xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm text-fg-muted mt-2">{subtitle}</p>}
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
