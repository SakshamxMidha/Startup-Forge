import { motion } from 'framer-motion';
import {
  FileDown, Presentation, Flame, Lightbulb, TrendingUp, DollarSign, Swords, Target,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAmbientMotion } from '@/hooks/useAmbientMotion';
import { revealUp, revealStagger, revealViewport } from '@/lib/motion';
import type { PitchDeck, PitchDeckSlide } from '@/types/api';

const slideMeta: { key: keyof PitchDeck['content']; label: string; icon: typeof Flame }[] = [
  { key: 'problemSlide', label: 'Problem', icon: Flame },
  { key: 'solutionSlide', label: 'Solution', icon: Lightbulb },
  { key: 'marketSlide', label: 'Market', icon: TrendingUp },
  { key: 'businessModelSlide', label: 'Business Model', icon: DollarSign },
  { key: 'competitionSlide', label: 'Competition', icon: Swords },
  { key: 'askSlide', label: 'The Ask', icon: Target },
];

function slideEntries(content: PitchDeck['content']) {
  return slideMeta.map((meta) => ({ ...meta, slide: content[meta.key] as PitchDeckSlide }));
}

// jsPDF (and the html2canvas it bundles internally) is only pulled into the bundle when a
// user actually downloads a deck, instead of loading on every page for a feature most
// sessions never touch — matters for a free-tier deploy.
async function downloadPitchDeckPdf(content: PitchDeck['content']) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;

  // Cover
  doc.setFillColor(13, 8, 10);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setFillColor(225, 29, 46);
  doc.rect(margin, pageHeight / 2 - 60, 44, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  const nameLines = doc.splitTextToSize(content.companyName, maxWidth);
  doc.text(nameLines, margin, pageHeight / 2 - 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(210, 190, 195);
  const taglineLines = doc.splitTextToSize(content.tagline, maxWidth);
  doc.text(taglineLines, margin, pageHeight / 2 - 20 + nameLines.length * 34 + 20);

  slideEntries(content).forEach(({ label, slide }, i) => {
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setFillColor(225, 29, 46);
    doc.rect(margin, 46, 34, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(158, 18, 34);
    doc.text(label.toUpperCase(), margin, 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.setTextColor(20, 12, 16);
    const titleLines = doc.splitTextToSize(slide.title, maxWidth);
    doc.text(titleLines, margin, 80);

    let y = 80 + titleLines.length * 24 + 22;
    slide.bullets.forEach((bullet) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(225, 29, 46);
      doc.text('✓', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 40, 44);
      const bulletLines = doc.splitTextToSize(bullet, maxWidth - 20);
      doc.text(bulletLines, margin + 18, y);
      y += bulletLines.length * 17 + 14;
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(170, 150, 155);
    doc.text(`${content.companyName}  ·  ${i + 2} / 7`, pageWidth - margin, pageHeight - 28, { align: 'right' });
  });

  const filename = `${content.companyName.trim().replace(/\s+/g, '-').toLowerCase() || 'pitch-deck'}-pitch-deck.pdf`;
  doc.save(filename);
}

export function PitchDeckView({ deck }: { deck: PitchDeck }) {
  const ambient = useAmbientMotion();
  const { content } = deck;

  return (
    <motion.div variants={revealStagger} initial="hidden" whileInView="show" viewport={revealViewport} className="space-y-5">
      {/* Cover */}
      <motion.div variants={revealUp}>
        <Card hover className="relative overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-bg-elev to-bg-soft">
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-crimson/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <motion.div
                animate={ambient ? { rotate: [0, -4, 4, 0] } : undefined}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-crimson to-ember flex items-center justify-center shadow-glow mb-5"
              >
                <Presentation className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
                <span className="gradient-text">{content.companyName}</span>
              </h2>
              <p className="text-fg-muted max-w-lg leading-relaxed">{content.tagline}</p>
              <p className="text-xs text-fg-subtle mt-4">
                Generated {new Date(deck.generatedAt).toLocaleString()}
              </p>
            </div>
            <Button variant="gradient" onClick={() => downloadPitchDeckPdf(content)} className="shrink-0">
              <FileDown className="w-4 h-4" /> Download PDF
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Slides */}
      <motion.div variants={revealStagger} initial="hidden" whileInView="show" viewport={revealViewport} className="grid sm:grid-cols-2 gap-4">
        {slideEntries(content).map(({ key, label, icon: Icon, slide }) => (
          <motion.div key={key} variants={revealUp}>
            <Card hover className="p-6 h-full relative overflow-hidden">
              <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-crimson/10 blur-3xl" />
              <div className="relative flex items-center gap-2 text-crimson mb-1.5">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-semibold tracking-wide uppercase text-fg-subtle">{label}</span>
              </div>
              <h3 className="relative font-display font-semibold text-lg mb-4 leading-snug">{slide.title}</h3>
              <ul className="relative space-y-2.5">
                {slide.bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-fg-muted">
                    <span className="text-crimson shrink-0 font-bold">✓</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
