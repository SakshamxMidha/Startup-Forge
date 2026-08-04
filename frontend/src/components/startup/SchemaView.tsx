import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { revealUp as item, revealStagger as stagger, revealViewport } from '@/lib/motion';
import type { SchemaDesign } from '@/types/api';

export function SchemaView({ schema, mermaidDiagram }: { schema: SchemaDesign; mermaidDiagram: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!mermaidDiagram) return;
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
        const { svg } = await mermaid.render(`schema-${schema.id.slice(0, 8)}`, mermaidDiagram);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setState('done');
        }
      } catch {
        if (!cancelled) setState('error');
      }
    }
    render();
    return () => { cancelled = true; };
  }, [mermaidDiagram, schema.id]);

  return (
    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={revealViewport} className="space-y-5">
      <motion.div variants={item}>
        <Card hover className="p-6 overflow-x-auto relative">
          <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-crimson/10 blur-3xl" />
          <h3 className="relative font-semibold mb-4">Entity-Relationship Diagram</h3>
          {state === 'error' ? (
            <pre className="relative text-xs text-fg-muted bg-bg-soft rounded-xl p-4 overflow-x-auto">{mermaidDiagram}</pre>
          ) : (
            <>
              {state === 'loading' && <Skeleton className="h-64 w-full" />}
              <div ref={ref} className={`relative flex justify-center [&_svg]:max-w-full ${state === 'loading' ? 'hidden' : ''}`} />
            </>
          )}
        </Card>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={revealViewport} className="grid sm:grid-cols-2 gap-4">
        {schema.entitiesJson.map(entity => (
          <motion.div key={entity.name} variants={item}>
            <Card hover className="p-5 h-full">
              <h4 className="font-semibold font-mono text-sm mb-3 text-crimson">{entity.name}</h4>
              <ul className="space-y-1.5">
                {entity.fields.map(f => (
                  <li key={f.name} className="flex justify-between text-sm">
                    <span className="font-mono text-fg-muted">{f.name}</span>
                    <Badge tone="neutral" className="font-mono text-[10px]">{f.type}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <h3 className="font-semibold mb-3">Relationships</h3>
        <div className="flex flex-wrap gap-2">
          {schema.relationsJson.map((r, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <Badge tone="gold" className="font-mono">
                {r.from} → {r.to} <span className="opacity-60">({r.type})</span>
              </Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
