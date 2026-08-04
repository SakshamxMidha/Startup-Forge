import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Brain, TrendingUp, Database, FileText, MessagesSquare,
  ArrowRight, Zap, ShieldCheck, Swords,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { FallingLeaves } from '@/components/fx/FallingLeaves';
import { Katana } from '@/components/fx/Katana';
import { useAmbientMotion } from '@/hooks/useAmbientMotion';
import { revealUp as fadeUp, revealStagger as stagger, revealViewport } from '@/lib/motion';

const features = [
  { icon: Brain, title: 'Idea Analysis', desc: 'Instant scoring on market, difficulty, and revenue with transparent AI reasoning.' },
  { icon: FileText, title: 'Business Plan', desc: 'Full plans with personas, SWOT, revenue streams, and growth strategy.' },
  { icon: TrendingUp, title: 'Market Research', desc: 'Real Hacker News signals synthesized into honest trend direction.' },
  { icon: MessagesSquare, title: 'AI Mentor', desc: 'Chat with a sensei grounded in your actual startup data via RAG.' },
  { icon: Database, title: 'Schema Design', desc: 'Database architecture generated and rendered as ER diagrams.' },
  { icon: Zap, title: 'Pitch Deck', desc: 'Investor-ready PDF decks with specific numbers, in seconds.' },
];

export default function Landing() {
  const { user } = useAuth();
  const ambient = useAmbientMotion();

  // Blade shine sweep is held back until the unsheath slide finishes, so it reads as a
  // distinct "flourish" beat rather than firing invisibly during the fade-in. Reduced-motion
  // users skip the choreography and just get the one-shot shine immediately (it's a small,
  // non-looping entrance flourish, not ambient motion).
  const [drawBlade, setDrawBlade] = useState(!ambient);
  useEffect(() => {
    if (!ambient) return;
    const t = setTimeout(() => setDrawBlade(true), 1650);
    return () => clearTimeout(t);
  }, [ambient]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <FallingLeaves density={22} />

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-40 flex justify-center p-4">
        <div className="glass flex items-center gap-2 pl-5 pr-2 py-2 rounded-2xl border border-border shadow-card">
          <div className="flex items-center gap-2.5 pr-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-crimson to-ember flex items-center justify-center shadow-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold">StartupForge</span>
          </div>
          {user ? (
            <Link to="/dashboard"><Button size="sm">Dashboard <ArrowRight className="w-4 h-4" /></Button></Link>
          ) : (
            <>
              <Link to="/login" className="px-3.5 py-2 rounded-xl text-sm font-medium text-fg-muted hover:text-fg hover:bg-bg-elev2 transition-colors">Sign in</Link>
              <Link to="/signup"><Button size="sm">Get started</Button></Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 overflow-hidden">
        {/* rising sun glow */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[620px] h-[620px] rounded-full animate-breathe pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgb(var(--ember)/.28), rgb(var(--crimson)/.12) 45%, transparent 68%)', filter: 'blur(20px)' }} />
        {/* drifting grid */}
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: 'linear-gradient(rgb(var(--crimson)/.05) 1px,transparent 1px),linear-gradient(90deg,rgb(var(--crimson)/.05) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black, transparent 78%)',
          }} />

        <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10">
          <motion.div variants={fadeUp} className="mono text-xs font-semibold text-gold tracking-[0.35em] mb-4">
            FORGE · PRECISION
          </motion.div>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-crimson/35 bg-crimson/8 text-crimson-bright text-xs font-semibold tracking-wide mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
            AI-POWERED · 6 MODULES · ZERO SETUP
          </motion.div>
        </motion.div>

        {/* Katana — dramatic unsheath: slide in from off-screen, a bright slash-flash as it
            arrives, blade shine sweep once settled, then a slow ambient sway. */}
        <div className="relative z-10 w-[min(760px,92vw)] my-2">
          {ambient && (
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-1/2 w-[160%] h-3 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgb(var(--katana-blade-2)) 42%, rgb(var(--crimson-bright)) 58%, transparent)',
                filter: 'blur(2px)',
                transformOrigin: 'center',
              }}
              initial={{ scaleX: 0, opacity: 0, rotate: -4 }}
              animate={{ scaleX: [0, 1.1, 1.1], opacity: [0, 1, 0], rotate: -4 }}
              transition={{ duration: 0.6, times: [0, 0.45, 1], delay: 1.1, ease: 'easeOut' }}
            />
          )}
          <motion.div
            initial={{ opacity: 0, x: -240, rotate: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
            transition={{ duration: 1.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              animate={ambient ? { y: [0, -10, 0], rotate: [0, 0.9, 0] } : undefined}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            >
              <Katana animate={drawBlade} glow className="w-full" />
            </motion.div>
          </motion.div>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10">
          <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1] mb-6">
            Cut through the noise.<br />
            <span className="gradient-text">Forge your startup.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-base sm:text-lg text-fg-muted max-w-xl mx-auto mb-9 leading-relaxed">
            Precision AI that slices a raw idea into analysis, business plans, market research, and investor-ready pitch decks — with a mentor grounded in your data.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={user ? '/dashboard' : '/signup'}>
              <Button variant="gradient" size="lg">Draw your blade <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-fg-subtle">
              <ShieldCheck className="w-4 h-4 text-success" /> Free · No card required
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport} className="text-center mb-14">
          <div className="mono text-xs font-semibold text-gold tracking-[0.35em] mb-3">THE ARSENAL</div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold mb-3">Six blades to <span className="gradient-text">launch</span>.</h2>
          <p className="text-fg-muted max-w-lg mx-auto">Each module is a precision instrument — from a one-line idea to an investor-ready company.</p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={revealViewport}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fadeUp} whileHover={{ y: -10, scale: 1.02 }}
              className="group relative overflow-hidden bg-bg-elev/60 border border-border rounded-2xl p-7 hover:border-crimson/40 hover:shadow-lift transition-colors">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-crimson to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <div className="w-12 h-12 rounded-xl bg-crimson/12 text-crimson-bright flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-crimson group-hover:to-ember group-hover:text-white group-hover:scale-110 group-hover:-rotate-6 transition-all">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1.5">{title}</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={revealViewport}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl p-10 sm:p-14 text-center border border-crimson/30"
          style={{ background: 'linear-gradient(135deg, rgb(var(--ember)/.25), rgb(var(--crimson)/.12), transparent)' }}>
          <Swords className="absolute -right-6 -bottom-6 w-40 h-40 text-crimson/10" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Your idea deserves a master's edge.</h2>
          <p className="text-fg-muted mb-8 max-w-lg mx-auto">Stop guessing. Get scored analysis, market data, and a full launch arsenal in one place.</p>
          <Link to={user ? '/dashboard' : '/signup'}>
            <Button variant="gradient" size="lg">Start forging <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-border-soft py-8 text-center text-sm text-fg-subtle">
        © {new Date().getFullYear()} StartupForge AI
      </footer>
    </div>
  );
}
