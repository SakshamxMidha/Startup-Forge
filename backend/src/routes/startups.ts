import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { analyzeIdea } from '../services/analyzeIdea';
import { generateBusinessPlan } from '../services/generateBusinessPlan';
import { generateSchemaDesign } from '../services/generateSchemaDesign';
import { schemaToMermaid } from '../services/schemaToMermaid';
import { generatePitchDeckContent } from '../services/generatePitchDeckContent';
import { renderPitchDeckHtml } from '../services/renderPitchDeckHtml';
import { generatePitchDeckPdf } from '../services/generatePitchDeckPdf';
import { searchHn } from '../services/hnApi';
import { synthesizeMarketReport } from '../services/synthesizeMarketReport';
import { ingestStartupKnowledge } from '../services/ingestKnowledge';
import { generateMentorReply } from '../services/mentorChat';


const router = Router();

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { rawIdea } = req.body;

  if (!rawIdea || typeof rawIdea !== 'string') {
    return res.status(400).json({ error: 'rawIdea is required' });
  }

  try {
    const startup = await prisma.startup.create({
      data: {
        userId: req.userId as string,
        rawIdea,
      },
    });

    const analysisResult = await analyzeIdea(rawIdea);

    const analysis = await prisma.analysis.create({
      data: {
        startupId: startup.id,
        ...analysisResult,
      },
    });

    res.status(201).json({ startup, analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze idea' });
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  const startupId = req.params.id as string;

  const startup = await prisma.startup.findUnique({
    where: { id: startupId },
    include: { analysis: true },
  });

  if (!startup) {
    return res.status(404).json({ error: 'Startup not found' });
  }

  if (startup.userId !== req.userId) {
    return res.status(403).json({ error: 'Not authorized to view this startup' });
  }

  res.json({ startup });
});

router.post('/:id/business-plan', requireAuth, async (req: AuthRequest, res) => {
  const startupId = req.params.id as string;

  const startup = await prisma.startup.findUnique({ where: { id: startupId } });

  if (!startup) {
    return res.status(404).json({ error: 'Startup not found' });
  }

  if (startup.userId !== req.userId) {
    return res.status(403).json({ error: 'Not authorized to modify this startup' });
  }

  try {
    const planResult = await generateBusinessPlan(startup.rawIdea);

    const businessPlan = await prisma.businessPlan.create({
      data: {
        startupId: startup.id,
        mission: planResult.mission,
        vision: planResult.vision,
        usp: planResult.usp,
        targetAudience: planResult.targetAudience,
        businessModel: planResult.businessModel,
        growthStrategy: planResult.growthStrategy,
        persona: {
          create: {
            name: planResult.persona.name,
            ageRange: planResult.persona.ageRange,
            behavior: planResult.persona.behavior,
            painPoints: {
              create: planResult.persona.painPoints.map((text) => ({ text })),
            },
          },
        },
        swotItems: {
          create: planResult.swotItems,
        },
        revenueStreams: {
          create: planResult.revenueStreams,
        },
      },
      include: {
        persona: { include: { painPoints: true } },
        swotItems: true,
        revenueStreams: true,
      },
    });

    res.status(201).json({ businessPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate business plan' });
  }
});

router.post('/:id/schema-design', requireAuth, async (req: AuthRequest, res) => {
  const startupId = req.params.id as string;

  const startup = await prisma.startup.findUnique({ where: { id: startupId } });

  if (!startup) {
    return res.status(404).json({ error: 'Startup not found' });
  }

  if (startup.userId !== req.userId) {
    return res.status(403).json({ error: 'Not authorized to modify this startup' });
  }

  try {
    const schemaResult = await generateSchemaDesign(startup.rawIdea);
    const mermaidDiagram = schemaToMermaid(schemaResult);

    const schemaDesign = await prisma.schemaDesign.create({
      data: {
        startupId: startup.id,
        entitiesJson: schemaResult.entities,
        relationsJson: schemaResult.relations,
      },
    });

    res.status(201).json({ schemaDesign, mermaidDiagram });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate schema design' });
  }
});

router.post('/:id/pitch-deck', requireAuth, async (req: AuthRequest, res) => {
  const startupId = req.params.id as string;

  const startup = await prisma.startup.findUnique({ where: { id: startupId } });

  if (!startup) {
    return res.status(404).json({ error: 'Startup not found' });
  }

  if (startup.userId !== req.userId) {
    return res.status(403).json({ error: 'Not authorized to modify this startup' });
  }

  try {
    const content = await generatePitchDeckContent(startup.rawIdea);
    const html = renderPitchDeckHtml(content);
    const filename = `pitch-${startup.id}.pdf`;
    await generatePitchDeckPdf(html, filename);

    const pdfUrl = `/generated-pdfs/${filename}`;

    const pitchDeck = await prisma.pitchDeck.create({
      data: {
        startupId: startup.id,
        pdfUrl,
      },
    });

    res.status(201).json({ pitchDeck });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate pitch deck' });
  }
});

router.post('/:id/market-research', requireAuth, async (req: AuthRequest, res) => {
  const startupId = req.params.id as string;

  const startup = await prisma.startup.findUnique({
    where: { id: startupId },
    include: { marketReport: true },
  });

  if (!startup) {
    return res.status(404).json({ error: 'Startup not found' });
  }

  if (startup.userId !== req.userId) {
    return res.status(403).json({ error: 'Not authorized to modify this startup' });
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  if (startup.marketReport && startup.marketReport.cachedAt > twentyFourHoursAgo) {
    const fullReport = await prisma.marketReport.findUnique({
      where: { id: startup.marketReport.id },
      include: { keywords: true, hnSignals: true },
    });
    return res.json({ marketReport: fullReport, cached: true });
  }

  try {
    const hnResults = await searchHn(startup.rawIdea);
    const synthesis = await synthesizeMarketReport(startup.rawIdea, hnResults);

    if (startup.marketReport) {
      await prisma.marketKeyword.deleteMany({ where: { marketReportId: startup.marketReport.id } });
      await prisma.hnSignal.deleteMany({ where: { marketReportId: startup.marketReport.id } });
      await prisma.marketReport.delete({ where: { id: startup.marketReport.id } });
    }

    const marketReport = await prisma.marketReport.create({
      data: {
        startupId: startup.id,
        trendDirection: synthesis.trendDirection,
        summary: synthesis.summary,
        cachedAt: new Date(),
        keywords: {
          create: synthesis.keywords.map((keyword) => ({ keyword })),
        },
        hnSignals: {
          create: hnResults.map((r) => ({
            title: r.title,
            points: r.points,
            url: r.url,
          })),
        },
      },
      include: {
        keywords: true,
        hnSignals: true,
      },
    });

    res.status(201).json({ marketReport, cached: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate market research' });
  }
});


router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const startups = await prisma.startup.findMany({
    where: { userId: req.userId },
    include: { analysis: true },
  });

  res.json({ startups });
});

router.post('/:id/ingest-knowledge', requireAuth, async (req: AuthRequest, res) => {
  const startupId = req.params.id as string;

  const startup = await prisma.startup.findUnique({ where: { id: startupId } });

  if (!startup) {
    return res.status(404).json({ error: 'Startup not found' });
  }

  if (startup.userId !== req.userId) {
    return res.status(403).json({ error: 'Not authorized to modify this startup' });
  }

  try {
    const chunkCount = await ingestStartupKnowledge(startupId);
    res.json({ success: true, chunksCreated: chunkCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to ingest knowledge' });
  }
});

router.post('/:id/mentor/chat', requireAuth, async (req: AuthRequest, res) => {
  const startupId = req.params.id as string;
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const startup = await prisma.startup.findUnique({ where: { id: startupId } });

  if (!startup) {
    return res.status(404).json({ error: 'Startup not found' });
  }

  if (startup.userId !== req.userId) {
    return res.status(403).json({ error: 'Not authorized to access this startup' });
  }

  try {
    const pastMessages = await prisma.mentorMessage.findMany({
      where: { startupId },
      orderBy: { createdAt: 'asc' },
    });

    const { reply, usedChunks } = await generateMentorReply(
      startupId,
      message,
      pastMessages.map((m) => ({ role: m.role, content: m.content }))
    );

    await prisma.mentorMessage.create({
      data: { startupId, role: 'user', content: message },
    });

    const assistantMessage = await prisma.mentorMessage.create({
      data: { startupId, role: 'assistant', content: reply },
    });

    res.status(201).json({ message: assistantMessage, usedChunks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate mentor reply' });
  }
});

router.get('/:id/mentor/history', requireAuth, async (req: AuthRequest, res) => {
  const startupId = req.params.id as string;

  const startup = await prisma.startup.findUnique({ where: { id: startupId } });

  if (!startup) {
    return res.status(404).json({ error: 'Startup not found' });
  }

  if (startup.userId !== req.userId) {
    return res.status(403).json({ error: 'Not authorized to access this startup' });
  }

  const messages = await prisma.mentorMessage.findMany({
    where: { startupId },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ messages });
});

export default router;