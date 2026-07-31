import { motion } from 'framer-motion';
import { Target, Eye, Gem, Users, DollarSign, TrendingUp as Growth } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { BusinessPlan, SwotCategory } from '@/types/api';

const swotTone: Record<SwotCategory, { tone: 'success' | 'danger' | 'gold' | 'warning'; label: string }> = {
  STRENGTH: { tone: 'success', label: 'Strength' },
  WEAKNESS: { tone: 'danger', label: 'Weakness' },
  OPPORTUNITY: { tone: 'gold', label: 'Opportunity' },
  THREAT: { tone: 'warning', label: 'Threat' },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function BusinessPlanView({ plan }: { plan: BusinessPlan }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { icon: Target, title: 'Mission', text: plan.mission },
          { icon: Eye, title: 'Vision', text: plan.vision },
          { icon: Gem, title: 'Unique Selling Proposition', text: plan.usp },
          { icon: Users, title: 'Target Audience', text: plan.targetAudience },
        ].map(({ icon: Icon, title, text }) => (
          <motion.div key={title} variants={item}>
            <Card hover className="p-5 h-full">
              <div className="flex items-center gap-2 text-crimson mb-2">
                <Icon className="w-4 h-4" />
                <h3 className="font-semibold text-fg text-sm">{title}</h3>
              </div>
              <p className="text-sm text-fg-muted">{text}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item}>
        <Badge tone="crimson" className="text-sm px-3 py-1 capitalize">{plan.businessModel} model</Badge>
      </motion.div>

      {plan.persona && (
        <motion.div variants={item}>
          <Card hover className="p-6 relative overflow-hidden">
            <div className="pointer-events-none absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-crimson/10 blur-3xl" />
            <h3 className="relative font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-crimson" /> Customer Persona</h3>
            <div className="relative flex items-start gap-4">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 4 }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-crimson to-ember flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-glow"
              >
                {plan.persona.name.charAt(0)}
              </motion.div>
              <div>
                <p className="font-medium">{plan.persona.name} <span className="text-fg-subtle font-normal">· {plan.persona.ageRange}</span></p>
                <p className="text-sm text-fg-muted mt-1">{plan.persona.behavior}</p>
                <ul className="mt-3 space-y-1.5">
                  {plan.persona.painPoints.map(pp => (
                    <li key={pp.id} className="text-sm text-fg-muted flex gap-2">
                      <span className="text-danger">✕</span> {pp.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={item}>
        <h3 className="font-semibold mb-3">SWOT Analysis</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {plan.swotItems.map(s => (
            <Card key={s.id} hover className="p-4">
              <Badge tone={swotTone[s.category].tone} className="mb-2">{swotTone[s.category].label}</Badge>
              <p className="text-sm text-fg-muted">{s.text}</p>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-success" /> Revenue Streams</h3>
        <div className="space-y-2">
          {plan.revenueStreams.map(r => (
            <Card key={r.id} hover className="p-4 flex items-center justify-between gap-4">
              <span className="font-medium text-sm">{r.name}</span>
              <span className="text-sm text-fg-muted text-right">{r.pricing}</span>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Growth className="w-4 h-4 text-gold" /> Growth Strategy</h3>
        <motion.ol variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} className="space-y-2">
          {plan.growthStrategy.map((g, i) => (
            <motion.li key={i} variants={item} className="flex gap-3 text-sm text-fg-muted">
              <span className="w-6 h-6 rounded-full bg-crimson/10 text-crimson flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
              <span className="pt-0.5">{g}</span>
            </motion.li>
          ))}
        </motion.ol>
      </motion.div>
    </motion.div>
  );
}
