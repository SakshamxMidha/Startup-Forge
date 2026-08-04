import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Rocket, Plus, Brain, FileText, TrendingUp, Database, Presentation,
  CheckCircle2, Circle, Layers, Clock,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useAmbientMotion } from '@/hooks/useAmbientMotion';
import { revealUp, revealStagger, revealViewport } from '@/lib/motion';
import { startupsApi, extractError } from '@/lib/api';
import type { StartupListItem, ModuleProgress } from '@/types/api';

const moduleMeta: { key: keyof ModuleProgress; label: string; icon: typeof Brain }[] = [
  { key: 'analysis', label: 'Analysis', icon: Brain },
  { key: 'businessPlan', label: 'Plan', icon: FileText },
  { key: 'marketResearch', label: 'Market', icon: TrendingUp },
  { key: 'schemaDesign', label: 'Schema', icon: Database },
  { key: 'pitchDeck', label: 'Deck', icon: Presentation },
];

function progressPct(p: ModuleProgress) {
  const done = Object.values(p).filter(Boolean).length;
  return Math.round((done / 5) * 100);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const ambient = useAmbientMotion();
  const [startups, setStartups] = useState<StartupListItem[] | null>(null);

  useEffect(() => {
    startupsApi.list()
      .then(setStartups)
      .catch((err) => toast.error(extractError(err)));
  }, []);

  const totalStartups = startups?.length ?? 0;
  const completed = startups?.filter(s => progressPct(s.progress) === 100).length ?? 0;
  const modulesBuilt = startups?.reduce((sum, s) => sum + Object.values(s.progress).filter(Boolean).length, 0) ?? 0;
  const inProgress = startups?.filter(s => progressPct(s.progress) < 100).length ?? 0;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <PageHeader
          title="Dashboard"
          subtitle="Pick up where you left off, or start something new."
          showKatana
          action={
            <Link to="/startups/new">
              <Button variant="gradient"><Plus className="w-4 h-4" /> New idea</Button>
            </Link>
          }
        />

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total ideas', value: totalStartups, icon: Rocket, tone: 'text-crimson bg-crimson/10' },
            { label: 'Fully complete', value: completed, icon: CheckCircle2, tone: 'text-success bg-success/10' },
            { label: 'Modules built', value: modulesBuilt, icon: Layers, tone: 'text-gold bg-gold/10' },
            { label: 'In progress', value: inProgress, icon: Clock, tone: 'text-warning bg-warning/10' },
          ].map(({ label, value, icon: Icon, tone }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 44, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.09, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card hover className="group relative overflow-hidden p-5">
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-crimson/0 group-hover:bg-crimson/30 blur-2xl transition-colors duration-500 pointer-events-none" />
                <motion.div
                  animate={ambient ? { y: [0, -5, 0] } : undefined}
                  transition={{ duration: 4.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  className={`relative w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${tone}`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </motion.div>
                <div className="relative text-2xl font-bold">
                  {startups === null
                    ? <Skeleton className="h-8 w-16" />
                    : <span className="gradient-text"><AnimatedCounter value={value} /></span>}
                </div>
                <div className="relative text-xs text-fg-muted mt-0.5">{label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Startup list */}
        <h2 className="text-lg font-semibold mb-4">My Startups</h2>

        {startups === null ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : startups.length === 0 ? (
          <EmptyState
            icon={<Rocket className="w-7 h-7" />}
            title="No startups yet"
            description="Describe your idea in one sentence and get an instant AI analysis with market, difficulty, and revenue scores."
            action={
              <Link to="/startups/new">
                <Button variant="gradient"><Plus className="w-4 h-4" /> Analyze your first idea</Button>
              </Link>
            }
          />
        ) : (
          <motion.div
            initial="hidden" whileInView="show" viewport={revealViewport}
            variants={revealStagger}
            className="grid sm:grid-cols-2 gap-4"
          >
            {startups.map((s) => {
              const pct = progressPct(s.progress);
              return (
                <motion.div key={s.id} variants={revealUp}>
                  <Card
                    hover
                    onClick={() => navigate(`/startups/${s.id}`)}
                    className="group relative overflow-hidden p-5 h-full hover:border-crimson/40 transition-colors"
                  >
                    {/* sweep highlight + corner glow, on hover */}
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-crimson to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-crimson/0 group-hover:bg-crimson/25 blur-3xl transition-colors duration-500 pointer-events-none" />
                    {/* tsuba-style corner accent */}
                    <div className="absolute top-3.5 right-3.5 w-2 h-2 rotate-45 border border-crimson/30 group-hover:border-crimson group-hover:shadow-glow transition-all" />

                    <div className="relative flex items-start justify-between gap-3 mb-3">
                      <p className="font-medium leading-snug line-clamp-2 pr-2">{s.rawIdea}</p>
                      {s.analysis && (
                        <Badge tone={s.analysis.competitionLevel === 'High' ? 'danger' : s.analysis.competitionLevel === 'Medium' ? 'warning' : 'success'}>
                          {s.analysis.competitionLevel}
                        </Badge>
                      )}
                    </div>

                    {/* progress bar */}
                    <div className="relative h-1.5 rounded-full bg-bg-soft overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-crimson to-ember"
                      />
                    </div>

                    <div className="relative flex items-center justify-between">
                      <div className="flex gap-2.5">
                        {moduleMeta.map(({ key, label, icon: Icon }) => (
                          <div key={key} className="flex flex-col items-center gap-0.5" title={label}>
                            {s.progress[key]
                              ? <CheckCircle2 className="w-4 h-4 text-success" />
                              : <Circle className="w-4 h-4 text-fg-subtle/50" />}
                            <span className="text-[10px] text-fg-subtle">{label}</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-fg-muted">{pct}%</span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
