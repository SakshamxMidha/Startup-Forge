import rateLimit from 'express-rate-limit';

function buildLimiter(windowMs: number, max: number, baseMessage: string) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const resetTime = (req as any).rateLimit?.resetTime;
      const resetText = resetTime
        ? ` Your limit refreshes at ${new Date(resetTime).toLocaleTimeString()}.`
        : '';
      res.status(429).json({ error: `${baseMessage}${resetText}` });
    },
  });
}

export const authLimiter = buildLimiter(
  15 * 60 * 1000,
  10,
  'Too many attempts, please try again later.'
);

export const llmLimiter = buildLimiter(
  60 * 60 * 1000,
  30,
  'Too many generation requests, please try again later.'
);