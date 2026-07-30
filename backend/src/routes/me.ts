import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, createdAt: true },
  });

  res.json({ user });
});
router.get('/usage', requireAuth, async (req: AuthRequest, res) => {
  const logs = await prisma.usageLog.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });

  const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
  const totalRequests = logs.length;

  const byEndpoint = logs.reduce((acc: Record<string, { requests: number; tokens: number }>, log) => {
    if (!acc[log.endpoint]) {
      acc[log.endpoint] = { requests: 0, tokens: 0 };
    }
    acc[log.endpoint].requests += 1;
    acc[log.endpoint].tokens += log.totalTokens;
    return acc;
  }, {});

  res.json({
    totalRequests,
    totalTokens,
    byEndpoint,
    recentLogs: logs.slice(0, 20),
  });
});
export default router;