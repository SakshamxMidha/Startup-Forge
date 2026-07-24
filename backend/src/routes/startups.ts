import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { analyzeIdea } from '../services/analyzeIdea';

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

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const startups = await prisma.startup.findMany({
    where: { userId: req.userId },
    include: { analysis: true },
  });

  res.json({ startups });
});

export default router;