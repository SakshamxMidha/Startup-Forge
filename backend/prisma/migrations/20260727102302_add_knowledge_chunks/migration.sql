CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id TEXT REFERENCES "Startup"(id),
  source TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(768),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);