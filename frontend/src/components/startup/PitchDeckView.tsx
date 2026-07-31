import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, ExternalLink, Presentation, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PitchDeck } from '@/types/api';

export function PitchDeckView({ deck }: { deck: PitchDeck }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  // Cloudinary serves raw PDFs with a download disposition, so an <iframe src=cloudinaryUrl>
  // renders blank. Fetch the bytes ourselves and hand the <iframe> a local blob: URL instead.
  useEffect(() => {
    let revoked = false;
    let currentUrl: string | null = null;
    setState('loading');
    setBlobUrl(null);

    fetch(deck.pdfUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        // force the correct type so the browser's PDF viewer kicks in
        const pdfBlob = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
        currentUrl = URL.createObjectURL(pdfBlob);
        if (!revoked) {
          setBlobUrl(currentUrl);
          setState('ready');
        }
      })
      .catch(() => setState('error'));

    return () => {
      revoked = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [deck.pdfUrl]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <Card hover className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-12 right-12 w-40 h-40 rounded-full bg-crimson/10 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, -4, 4, 0] }}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-crimson to-ember flex items-center justify-center shadow-glow"
          >
            <Presentation className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="font-semibold">Investor Pitch Deck</h3>
            <p className="text-xs text-fg-muted">
              Generated {new Date(deck.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="relative flex gap-2">
          <a href={deck.pdfUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm"><ExternalLink className="w-4 h-4" /> Open in new tab</Button>
          </a>
          <a href={blobUrl ?? deck.pdfUrl} download={`pitch-deck.pdf`}>
            <Button size="sm"><FileDown className="w-4 h-4" /> Download</Button>
          </a>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {state === 'loading' && (
          <div className="h-[70vh] flex flex-col items-center justify-center gap-3 text-fg-muted">
            <Loader2 className="w-6 h-6 animate-spin text-crimson" />
            <span className="text-sm">Loading preview…</span>
          </div>
        )}
        {state === 'error' && (
          <div className="h-[400px] flex flex-col items-center justify-center gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-warning/12 text-warning flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm text-fg-muted max-w-sm">
              The inline preview couldn't load, but your deck is ready. Open it in a new tab or download it below.
            </p>
            <a href={deck.pdfUrl} target="_blank" rel="noreferrer">
              <Button size="sm"><ExternalLink className="w-4 h-4" /> Open pitch deck</Button>
            </a>
          </div>
        )}
        {state === 'ready' && blobUrl && (
          <iframe src={blobUrl} title="Pitch deck preview" className="w-full h-[70vh] border-0 bg-white" />
        )}
      </Card>
    </motion.div>
  );
}
