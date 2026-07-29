import prisma from '../lib/prisma';
import { embedText } from './embeddings';

interface Chunk {
  source: string;
  content: string;
}

function buildBusinessPlanChunks(bp: any): Chunk[] {
  const chunks: Chunk[] = [];

  chunks.push({ source: 'business_plan', content: `Mission: ${bp.mission}` });
  chunks.push({ source: 'business_plan', content: `Vision: ${bp.vision}` });
  chunks.push({ source: 'business_plan', content: `Unique selling proposition: ${bp.usp}` });
  chunks.push({
    source: 'business_plan',
    content: `Target audience: ${bp.targetAudience}. Business model: ${bp.businessModel}.`,
  });

  if (bp.persona) {
    const painPoints = bp.persona.painPoints.map((p: any) => p.text).join('; ');
    chunks.push({
      source: 'business_plan',
      content: `Customer persona "${bp.persona.name}" (age ${bp.persona.ageRange}): ${bp.persona.behavior}. Pain points: ${painPoints}`,
    });
  }

  for (const item of bp.swotItems || []) {
    chunks.push({ source: 'business_plan', content: `SWOT (${item.category}): ${item.text}` });
  }

  for (const rs of bp.revenueStreams || []) {
    chunks.push({ source: 'business_plan', content: `Revenue stream "${rs.name}": ${rs.pricing}` });
  }

  if (bp.growthStrategy?.length) {
    chunks.push({ source: 'business_plan', content: `Growth strategy: ${bp.growthStrategy.join('; ')}` });
  }

  return chunks;
}

function buildMarketReportChunks(mr: any): Chunk[] {
  const chunks: Chunk[] = [
    {
      source: 'market_report',
      content: `Market trend direction: ${mr.trendDirection}. Summary: ${mr.summary}`,
    },
  ];

  if (mr.keywords?.length) {
    chunks.push({
      source: 'market_report',
      content: `Relevant market keywords: ${mr.keywords.map((k: any) => k.keyword).join(', ')}`,
    });
  }

  return chunks;
}

export async function ingestStartupKnowledge(startupId: string): Promise<number> {
  await prisma.$executeRaw`DELETE FROM knowledge_chunks WHERE startup_id = ${startupId}`;

  const businessPlan = await prisma.businessPlan.findUnique({
    where: { startupId },
    include: { persona: { include: { painPoints: true } }, swotItems: true, revenueStreams: true },
  });

  const marketReport = await prisma.marketReport.findUnique({
    where: { startupId },
    include: { keywords: true },
  });

  const chunks: Chunk[] = [
    ...(businessPlan ? buildBusinessPlanChunks(businessPlan) : []),
    ...(marketReport ? buildMarketReportChunks(marketReport) : []),
  ];

  for (const chunk of chunks) {
    const embedding = await embedText(chunk.content);
    const vectorLiteral = `[${embedding.join(',')}]`;

    await prisma.$executeRaw`
      INSERT INTO knowledge_chunks (startup_id, source, content, embedding)
      VALUES (${startupId}, ${chunk.source}, ${chunk.content}, ${vectorLiteral}::vector)
    `;
  }

  return chunks.length;
}