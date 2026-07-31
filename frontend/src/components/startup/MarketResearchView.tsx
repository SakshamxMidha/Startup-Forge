import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ExternalLink, Flame, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { MarketReport } from '@/types/api';

const trendMeta = {
  rising: { icon: TrendingUp, tone: 'success' as const, label: 'Rising' },
  flat: { icon: Minus, tone: 'warning' as const, label: 'Flat' },
  declining: { icon: TrendingDown, tone: 'danger' as const, label: 'Declining' },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function MarketResearchView({ report, cached, onRefresh, refreshing }: {
  report: MarketReport; cached?: boolean; onRefresh?: () => void; refreshing?: boolean;
}) {
  const trend = trendMeta[report.trendDirection] ?? trendMeta.flat;
  const TrendIcon = trend.icon;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Badge tone={trend.tone} className="text-sm px-3 py-1">
            <TrendIcon className="w-3.5 h-3.5" /> {trend.label}
          </Badge>
          {cached && (
            <span className="text-xs text-fg-subtle">
              Cached · {new Date(report.cachedAt).toLocaleString()}
            </span>
          )}
        </div>
        {onRefresh && (
          <Button variant="secondary" size="sm" onClick={onRefresh} loading={refreshing}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        )}
      </motion.div>

      <motion.div variants={item}>
        <Card hover className="p-6 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-14 -right-14 w-44 h-44 rounded-full bg-crimson/10 blur-3xl" />
          <h3 className="relative font-semibold mb-2">Market Summary</h3>
          <p className="relative text-sm text-fg-muted leading-relaxed">{report.summary}</p>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <h3 className="font-semibold mb-3">Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {report.keywords.map(k => (
            <motion.div key={k.id} whileHover={{ scale: 1.08 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <Badge tone="crimson">{k.keyword}</Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-warning" /> Hacker News Signals
        </h3>
        {report.hnSignals.length === 0 ? (
          <Card className="p-5 text-sm text-fg-muted">
            No directly relevant HN discussions found — the summary above notes what that thin signal means for this idea.
          </Card>
        ) : (
          <motion.div variants={stagger} className="space-y-2">
            {report.hnSignals.map(h => (
              <motion.a key={h.id} variants={item} href={h.url} target="_blank" rel="noreferrer" className="block">
                <Card hover className="p-4 flex items-center justify-between gap-3 mb-2">
                  <span className="text-sm">{h.title}</span>
                  <span className="flex items-center gap-2 text-xs text-fg-subtle shrink-0">
                    ▲ {h.points}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </Card>
              </motion.a>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
