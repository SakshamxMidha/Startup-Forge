import prisma from '../lib/prisma';
import { embedText } from './embeddings';

export interface RetrievedChunk {
  source: string;
  content: string;
  distance: number;
}

export async function retrieveRelevantChunks(
  startupId: string,
  query: string,
  topK: number = 5
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedText(query);
  const vectorLiteral = `[${queryEmbedding.join(',')}]`;

  const results = await prisma.$queryRaw<RetrievedChunk[]>`
    SELECT source, content, embedding <=> ${vectorLiteral}::vector as distance
    FROM knowledge_chunks
    WHERE startup_id = ${startupId} OR startup_id IS NULL
    ORDER BY distance ASC
    LIMIT ${topK}
  `;

  return results;
}