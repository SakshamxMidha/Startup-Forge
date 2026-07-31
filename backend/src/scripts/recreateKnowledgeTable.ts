import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS knowledge_chunks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      startup_id TEXT REFERENCES "Startup"(id),
      source TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding VECTOR(768),
      created_at TIMESTAMP DEFAULT now()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
    ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);
  `);

  console.log('✓ knowledge_chunks table recreated');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => process.exit(0));