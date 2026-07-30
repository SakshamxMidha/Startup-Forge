import prisma from '../lib/prisma';
import { GenerationUsage } from './llm';

export async function logUsage(userId: string, endpoint: string, usage: GenerationUsage) {
  await prisma.usageLog.create({
    data: {
      userId,
      endpoint,
      promptTokens: usage.promptTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
    },
  });
}