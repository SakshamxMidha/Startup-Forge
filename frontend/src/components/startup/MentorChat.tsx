import { FormEvent, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Send, Sparkles, BookOpen, Loader2, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { startupsApi, extractError } from '@/lib/api';
import type { MentorMessage, RetrievedChunk } from '@/types/api';

const sourceLabel: Record<string, string> = {
  business_plan: 'Business plan',
  market_report: 'Market report',
  curated_advice: 'Startup wisdom',
};

export function MentorChat({ startupId }: { startupId: string }) {
  const [messages, setMessages] = useState<MentorMessage[] | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastChunks, setLastChunks] = useState<RetrievedChunk[]>([]);
  const [showSources, setShowSources] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startupsApi.mentorHistory(startupId)
      .then(setMessages)
      .catch(err => toast.error(extractError(err)));
  }, [startupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const syncKnowledge = async () => {
    setIngesting(true);
    try {
      const { chunksCreated } = await startupsApi.ingestKnowledge(startupId);
      toast.success(`Mentor synced — ${chunksCreated} knowledge chunks indexed.`);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setIngesting(false);
    }
  };

  const send = async (ev: FormEvent) => {
    ev.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);

    // optimistic user message
    const optimistic: MentorMessage = {
      id: `tmp-${Date.now()}`, startupId, role: 'user', content: text, createdAt: new Date().toISOString(),
    };
    setMessages(m => [...(m ?? []), optimistic]);

    try {
      const { message, usedChunks } = await startupsApi.mentorChat(startupId, text);
      setMessages(m => [...(m ?? []), message]);
      setLastChunks(usedChunks);
    } catch (err) {
      toast.error(extractError(err));
      setMessages(m => (m ?? []).filter(msg => msg.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-fg-subtle">Answers grounded in this startup's plan, market data, and curated advice.</p>
        <Button variant="secondary" size="sm" onClick={syncKnowledge} loading={ingesting}>
          <BrainCircuit className="w-3.5 h-3.5" /> Sync knowledge
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-border-soft bg-bg-soft/40 p-4 space-y-4">
        {messages === null ? (
          <div className="flex items-center justify-center h-full text-fg-subtle">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-7 h-7" />}
            title="Ask your AI mentor anything"
            description={'Try: "How should I price my subscription tiers?" or "What\'s my biggest weakness?" Tip: hit Sync knowledge first so the mentor knows your latest plan.'}
          />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map(m => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                  ${m.role === 'user'
                    ? 'bg-crimson-fill text-white rounded-br-md'
                    : 'bg-bg-elev border border-border-soft rounded-bl-md'}`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-bg-elev border border-border-soft rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-fg-subtle"
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {lastChunks.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowSources(s => !s)}
            className="text-xs text-fg-subtle hover:text-fg flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {showSources ? 'Hide' : 'Show'} sources for last answer ({lastChunks.length})
          </button>
          <AnimatePresence>
            {showSources && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1.5">
                  {lastChunks.map((c, i) => (
                    <div key={i} className="text-xs bg-bg-soft rounded-lg p-2.5 flex gap-2">
                      <Badge tone="crimson" className="shrink-0 self-start">{sourceLabel[c.source] ?? c.source}</Badge>
                      <span className="text-fg-muted line-clamp-2">{c.content}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask your mentor…"
          disabled={sending}
          className="flex-1 h-11 px-4 rounded-xl bg-bg-elev border border-border outline-none focus:border-crimson focus:ring-2 focus:ring-crimson/25 transition-all text-sm"
        />
        <Button type="submit" disabled={!input.trim()} loading={sending} aria-label="Send">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
