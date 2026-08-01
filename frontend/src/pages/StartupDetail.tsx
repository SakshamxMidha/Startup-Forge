import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Brain, FileText, TrendingUp, Database, Presentation, MessagesSquare,
  ArrowLeft, Sparkles, Loader2, RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Katana } from '@/components/fx/Katana';
import { AnalysisView } from '@/components/startup/AnalysisView';
import { BusinessPlanView } from '@/components/startup/BusinessPlanView';
import { MarketResearchView } from '@/components/startup/MarketResearchView';
import { SchemaView } from '@/components/startup/SchemaView';
import { PitchDeckView } from '@/components/startup/PitchDeckView';
import { MentorChat } from '@/components/startup/MentorChat';
import { startupsApi, extractError, isNotFound } from '@/lib/api';
import type { Startup, BusinessPlan, MarketReport, SchemaDesign, PitchDeck } from '@/types/api';

type TabKey = 'analysis' | 'plan' | 'market' | 'schema' | 'deck' | 'mentor';

const tabs: { key: TabKey; label: string; icon: typeof Brain }[] = [
  { key: 'analysis', label: 'Analysis', icon: Brain },
  { key: 'plan', label: 'Business Plan', icon: FileText },
  { key: 'market', label: 'Market Research', icon: TrendingUp },
  { key: 'schema', label: 'Schema', icon: Database },
  { key: 'deck', label: 'Pitch Deck', icon: Presentation },
  { key: 'mentor', label: 'AI Mentor', icon: MessagesSquare },
];

// A saved module is fetched lazily the first time its tab is opened: 'idle' → 'loading' →
// 'ready' (found a saved result) or 'empty' (nothing saved yet, show the Generate button).
type ModuleStatus = 'idle' | 'loading' | 'ready' | 'empty';
interface ModuleState<T> {
  status: ModuleStatus;
  data: T | null;
}
const idleModule = <T,>(): ModuleState<T> => ({ status: 'idle', data: null });

function useSavedModule<T>(id: string, active: boolean, fetcher: (id: string) => Promise<T>) {
  const [state, setState] = useState<ModuleState<T>>(idleModule<T>());

  useEffect(() => {
    if (!active || state.status !== 'idle') return;
    setState({ status: 'loading', data: null });
    fetcher(id)
      .then((data) => setState({ status: 'ready', data }))
      .catch((err) => {
        if (!isNotFound(err)) toast.error(extractError(err));
        setState({ status: 'empty', data: null });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, id, state.status]);

  return [state, setState] as const;
}

export default function StartupDetail() {
  const { id = '' } = useParams();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [tab, setTab] = useState<TabKey>('analysis');
  const [generating, setGenerating] = useState<TabKey | null>(null);

  const [planState, setPlanState] = useSavedModule<BusinessPlan>(id, tab === 'plan', startupsApi.getBusinessPlan);
  const [marketState, setMarketState] = useSavedModule<{ report: MarketReport; cached: boolean }>(
    id,
    tab === 'market',
    (sid) => startupsApi.getMarketResearch(sid).then(({ marketReport, cached }) => ({ report: marketReport, cached }))
  );
  const [schemaState, setSchemaState] = useSavedModule<{ design: SchemaDesign; mermaid: string }>(
    id,
    tab === 'schema',
    (sid) => startupsApi.getSchema(sid).then(({ schemaDesign, mermaidDiagram }) => ({ design: schemaDesign, mermaid: mermaidDiagram }))
  );
  const [deckState, setDeckState] = useSavedModule<PitchDeck>(id, tab === 'deck', startupsApi.getPitchDeck);

  useEffect(() => {
    startupsApi.get(id)
      .then(setStartup)
      .catch(err => toast.error(extractError(err)));
  }, [id]);

  const generate = async (which: TabKey) => {
    setGenerating(which);
    try {
      if (which === 'plan') {
        const data = await startupsApi.generateBusinessPlan(id);
        setPlanState({ status: 'ready', data });
        toast.success('Business plan generated!');
      } else if (which === 'market') {
        const { marketReport, cached } = await startupsApi.generateMarketResearch(id);
        setMarketState({ status: 'ready', data: { report: marketReport, cached } });
        toast.success(cached ? 'Loaded cached market report' : 'Market research complete!');
      } else if (which === 'schema') {
        const { schemaDesign, mermaidDiagram } = await startupsApi.generateSchemaDesign(id);
        setSchemaState({ status: 'ready', data: { design: schemaDesign, mermaid: mermaidDiagram } });
        toast.success('Schema designed!');
      } else if (which === 'deck') {
        const data = await startupsApi.generatePitchDeck(id);
        setDeckState({ status: 'ready', data });
        toast.success('Pitch deck generated!');
      }
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setGenerating(null);
    }
  };

  const genButton = (which: TabKey, label: string) => (
    <EmptyState
      icon={<Sparkles className="w-7 h-7" />}
      title={`No ${label.toLowerCase()} yet`}
      description={`Generate the ${label.toLowerCase()} for this idea with one click. Takes a few seconds.`}
      action={
        <Button variant="gradient" onClick={() => generate(which)} loading={generating === which}>
          <Sparkles className="w-4 h-4" /> Generate {label}
        </Button>
      }
    />
  );

  const loadingSpinner = (
    <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-crimson" /></div>
  );

  const regenerateBar = (which: TabKey, label: string) => (
    <div className="flex justify-end mb-3">
      <Button variant="ghost" size="sm" onClick={() => generate(which)} loading={generating === which}>
        <RefreshCw className="w-3.5 h-3.5" /> Regenerate {label}
      </Button>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        {startup === null ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
            <Katana
              variant="hilt"
              glow
              className="hidden sm:block w-9 h-9 shrink-0 mt-1 opacity-90 pointer-events-none select-none"
            />
            <div>
              <h1 className="text-2xl font-bold leading-snug">{startup.rawIdea}</h1>
              <p className="text-sm text-fg-subtle mt-1">
                Created {new Date(startup.createdAt).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-8 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${tab === key ? 'text-fg' : 'text-fg-muted hover:text-fg'}`}
            >
              {tab === key && (
                <motion.div
                  layoutId="tab-active"
                  className="absolute inset-0 bg-bg-elev border border-border rounded-xl shadow-card"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'analysis' && (
              startup?.analysis
                ? <AnalysisView analysis={startup.analysis} />
                : startup
                  ? <EmptyState icon={<Brain className="w-7 h-7" />} title="No analysis found" description="This startup was created without an analysis — this shouldn't normally happen." />
                  : loadingSpinner
            )}

            {tab === 'plan' && (
              planState.status === 'ready' && planState.data
                ? <>{regenerateBar('plan', 'Plan')}<BusinessPlanView plan={planState.data} /></>
                : planState.status === 'empty'
                  ? genButton('plan', 'Business Plan')
                  : loadingSpinner
            )}

            {tab === 'market' && (
              marketState.status === 'ready' && marketState.data
                ? <MarketResearchView
                    report={marketState.data.report}
                    cached={marketState.data.cached}
                    onRefresh={() => generate('market')}
                    refreshing={generating === 'market'}
                  />
                : marketState.status === 'empty'
                  ? genButton('market', 'Market Research')
                  : loadingSpinner
            )}

            {tab === 'schema' && (
              schemaState.status === 'ready' && schemaState.data
                ? <>{regenerateBar('schema', 'Schema')}<SchemaView schema={schemaState.data.design} mermaidDiagram={schemaState.data.mermaid} /></>
                : schemaState.status === 'empty'
                  ? genButton('schema', 'Schema Design')
                  : loadingSpinner
            )}

            {tab === 'deck' && (
              deckState.status === 'ready' && deckState.data
                ? <>{regenerateBar('deck', 'Deck')}<PitchDeckView deck={deckState.data} /></>
                : deckState.status === 'empty'
                  ? genButton('deck', 'Pitch Deck')
                  : loadingSpinner
            )}

            {tab === 'mentor' && <MentorChat startupId={id} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
