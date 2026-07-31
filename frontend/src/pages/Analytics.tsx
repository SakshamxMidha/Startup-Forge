import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Rocket, CheckCircle2, Flame, TrendingUp, Brain, FileText,
  Database, Presentation, MessagesSquare, Activity, ArrowRight, Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { EmptyState } from '@/components/ui/EmptyState';
import { startupsApi, userApi, extractError } from '@/lib/api';
import type { StartupListItem, UsageSummary, ModuleProgress } from '@/types/api';

// Turn a raw backend endpoint into a human, founder-friendly action label.
const actionLabel: Record<string, { label: string; icon: typeof Brain }> = {
  'POST /startups': { label: 'Analyzed a new idea', icon: Brain },
  'POST /startups/:id/business-plan': { label: 'Generated a business plan', icon: FileText },
  'POST /startups/:id/market-research': { label: 'Ran market research', icon: TrendingUp },
  'POST /startups/:id/schema-design': { label: 'Designed a database schema', icon: Database },
  'POST /startups/:id/pitch-deck': { label: 'Built a pitch deck', icon: Presentation },
};

function progressCount(p: ModuleProgress) {
  return Object.values(p).filter(Boolean).length;
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function Analytics() {
  const [startups, setStartups] = useState<StartupListItem[] | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  useEffect(() => {
    Promise.all([startupsApi.list(), userApi.usage()])
      .then(([s, u]) => { setStartups(s); setUsage(u); })
      .catch((err) => toast.error(extractError(err)));
  }, []);

  const totalIdeas = startups?.length ?? 0;
  const modulesBuilt = startups?.reduce((sum, s) => sum + progressCount(s.progress), 0) ?? 0;
  const totalPossible = totalIdeas * 5;
  const completionRate = totalPossible > 0 ? Math.round((modulesBuilt / totalPossible) * 100) : 0;
  const fullyComplete = startups?.filter(s => progressCount(s.progress) === 5).length ?? 0;

  // rank startups by how far along they are
  const ranked = startups
    ? [...startups].sort((a, b) => progressCount(b.progress) - progressCount(a.progress))
    : [];

  const loading = startups === null || usage === null;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <PageHeader title="Your Activity" subtitle="Everything you've forged so far — and what's still on the anvil." showKatana />

        {/* momentum cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Ideas forged', value: totalIdeas, icon: Rocket, tone: 'text-crimson bg-crimson/10' },
            { label: 'Modules built', value: modulesBuilt, icon: Flame, tone: 'text-gold bg-gold/10' },
            { label: 'Fully complete', value: fullyComplete, icon: CheckCircle2, tone: 'text-success bg-success/10' },
            { label: 'Completion', value: completionRate, suffix: '%', icon: TrendingUp, tone: 'text-crimson-bright bg-crimson/10' },
          ].map(({ label, value, suffix, icon: Icon, tone }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card hover className="group relative overflow-hidden p-5">
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-crimson/0 group-hover:bg-crimson/20 blur-2xl transition-colors duration-500 pointer-events-none" />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  className={`relative w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${tone}`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </motion.div>
                <div className="relative font-display text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : <span className="gradient-text"><AnimatedCounter value={value} />{suffix}</span>}
                </div>
                <div className="relative text-xs text-fg-muted mt-0.5">{label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : totalIdeas === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-7 h-7" />}
            title="Nothing forged yet"
            description="Analyze your first idea and this page will track everything you build — your progress, momentum, and recent activity."
            action={<Link to="/startups/new"><Badge tone="crimson" className="text-sm px-4 py-2 cursor-pointer">Analyze an idea <ArrowRight className="w-3.5 h-3.5" /></Badge></Link>}
          />
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Your ideas, ranked by progress */}
            <div>
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-crimson" /> Furthest along
              </h3>
              <motion.div
                initial="hidden" animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
                className="space-y-3"
              >
                {ranked.slice(0, 5).map((s) => {
                  const done = progressCount(s.progress);
                  const pct = (done / 5) * 100;
                  return (
                    <motion.div key={s.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                      <Link to={`/startups/${s.id}`}>
                        <Card hover className="p-4 hover:border-crimson/40 transition-colors">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <p className="text-sm font-medium line-clamp-1">{s.rawIdea}</p>
                            <Badge tone={done === 5 ? 'success' : 'crimson'} className="shrink-0">{done}/5</Badge>
                          </div>
                          <div className="h-1.5 rounded-full bg-bg-soft overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full rounded-full bg-gradient-to-r from-crimson to-gold" />
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Recent activity, humanized */}
            <div>
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-crimson" /> Recent activity
              </h3>
              {usage.recentLogs.length === 0 ? (
                <Card className="p-5 text-sm text-fg-muted">No activity yet — generate a module to see it here.</Card>
              ) : (
                <div className="space-y-2">
                  {usage.recentLogs.slice(0, 8).map((log, i) => {
                    const meta = actionLabel[log.endpoint] ?? { label: 'AI action', icon: MessagesSquare };
                    const Icon = meta.icon;
                    return (
                      <motion.div key={log.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.05, 0.4) }}>
                        <Card hover className="p-3.5 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-crimson/10 text-crimson flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{meta.label}</p>
                            <p className="text-xs text-fg-subtle">{timeAgo(log.createdAt)}</p>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
