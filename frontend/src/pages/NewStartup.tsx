import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Lightbulb, Swords, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Katana } from '@/components/fx/Katana';
import { startupsApi, extractError } from '@/lib/api';
import { useAmbientMotion } from '@/hooks/useAmbientMotion';

const examples = [
  'A subscription box for artisanal hot sauce',
  'An AI copilot for wedding planning',
  'A marketplace connecting local farms to restaurants',
  'A fitness app that pays you crypto for workouts',
];

const loadingSteps = [
  'Unsheathing the blade…',
  'Scoring market potential…',
  'Testing the edge…',
  'Reading the competition…',
  'Delivering the verdict…',
];

export default function NewStartup() {
  const navigate = useNavigate();
  const ambient = useAmbientMotion();
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (idea.trim().length < 10) {
      toast.error('Describe your idea in at least a short sentence.');
      return;
    }
    setLoading(true);
    const stepper = setInterval(() => setStepIdx(i => Math.min(i + 1, loadingSteps.length - 1)), 1600);
    try {
      const { startup } = await startupsApi.create(idea.trim());
      toast.success('Analysis complete!');
      navigate(`/startups/${startup.id}`);
    } catch (err) {
      toast.error(extractError(err));
      setLoading(false);
    } finally {
      clearInterval(stepper);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <PageHeader title="Analyze a new idea" subtitle="One sentence is enough — the AI does the rest." showKatana />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex justify-center mb-3"
        >
          <motion.div
            animate={ambient ? { y: [0, -6, 0] } : undefined}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-56 opacity-60"
          >
            <Katana animate />
          </motion.div>
        </motion.div>

        <form onSubmit={onSubmit}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-border rounded-2xl focus-within:shadow-glow-lg transition-shadow duration-300"
          >
            <div className="absolute top-2 right-2 w-40 h-40 rounded-full bg-crimson/10 blur-3xl pointer-events-none" />
            <textarea
              value={idea}
              onChange={e => setIdea(e.target.value)}
              disabled={loading}
              rows={4}
              placeholder="e.g. A subscription box for artisanal hot sauce…"
              className="relative w-full bg-transparent rounded-2xl p-5 text-lg resize-none outline-none placeholder:text-fg-subtle"
            />
          </motion.div>

          <div className="flex flex-wrap gap-2 mt-4">
            {examples.map(ex => (
              <button
                key={ex}
                type="button"
                onClick={() => setIdea(ex)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-fg-muted hover:text-fg hover:border-crimson/40 hover:bg-crimson/5 transition-colors"
              >
                <Lightbulb className="w-3 h-3 inline mr-1" />
                {ex}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 text-fg-muted"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-crimson" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={stepIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-sm"
                    >
                      {loadingSteps[stepIdx]}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Button type="submit" variant="gradient" size="lg">
                    <Swords className="w-4 h-4" /> Draw the blade
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
