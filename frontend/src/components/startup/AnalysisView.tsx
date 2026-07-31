import { motion } from 'framer-motion';
import { Clock, Swords, Quote } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';
import type { Analysis } from '@/types/api';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function AnalysisView({ analysis }: { analysis: Analysis }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}>
        <Card hover className="p-6 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-crimson/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-around gap-6">
            <ScoreRing score={analysis.marketScore} label="Market" />
            <ScoreRing score={10 - analysis.difficultyScore} label="Feasibility" />
            <ScoreRing score={analysis.revenueScore} label="Revenue" />
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-fg-muted text-sm">
                <Swords className="w-4 h-4" /> Competition
              </div>
              <Badge tone={analysis.competitionLevel === 'High' ? 'danger' : analysis.competitionLevel === 'Medium' ? 'warning' : 'success'} className="text-sm px-3 py-1">
                {analysis.competitionLevel}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-fg-subtle">
                <Clock className="w-3.5 h-3.5" /> ~{analysis.timeToBuildWeeks} weeks to MVP
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card hover className="p-6 border-l-4 border-l-brand">
          <div className="flex items-start gap-3">
            <Quote className="w-5 h-5 text-crimson shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Recommendation</h3>
              <p className="text-fg-muted">{analysis.recommendation}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card hover className="p-6">
          <h3 className="font-semibold mb-2">Reasoning</h3>
          <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-line">{analysis.reasoning}</p>
        </Card>
      </motion.div>
    </motion.div>
  );
}
