# StartupForge AI — Project Plan & Architecture (Node.js + PostgreSQL)

Scope: 6-module version (Idea Analyzer, Business Generator, Market Research Engine, AI Mentor RAG, Schema Generator, Pitch Deck Generator). Solo build, 7-9 weeks.

Stack chosen to match your existing projects: Node.js/TypeScript (InHire) + PostgreSQL (AirGuard) — deepens two skills already on your resume instead of splitting across a third language/DB.

---

## 1. System Overview

```
┌─────────────┐      ┌──────────────────────┐      ┌──────────────────┐
│  React SPA   │◄────►│  Node.js Backend      │◄────►│   PostgreSQL       │
│ (TypeScript) │      │  (Express/Fastify +   │      │  (+ pgvector ext)  │
│              │      │   TypeScript)         │      │                    │
└─────────────┘      └──────────┬───────────┘      └────────────────────┘
                                 │
                  ┌──────────────┼───────────────┐
                  │              │               │
          ┌───────▼──────┐ ┌─────▼──────┐ ┌──────▼───────┐
          │ LLM Provider  │ │ External    │ │ pgvector     │
          │ (via          │ │ APIs        │ │ (RAG         │
          │ LangChain.js) │ │ (Trends,    │ │  embeddings, │
          │               │ │ Reddit, HN) │ │  same DB)    │
          └───────────────┘ └────────────┘ └──────────────┘
```

**Core principle:** one Postgres database, relationally normalized, with `pgvector` handling embeddings in the same DB — no separate vector store to run/manage. Every module writes to tables tied to a `startup_id` foreign key, so the whole workspace stays queryable with normal joins.

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + TypeScript, Vite | matches InHire |
| Backend | Node.js + Express or Fastify + TypeScript | matches InHire, one language across full stack |
| ORM | Prisma | TypeScript-native, strong migration story, clean schema file to show in interviews |
| DB | PostgreSQL + `pgvector` extension | matches AirGuard, relational fit for structured data, one DB for both relational + vector search |
| LLM (primary) | Google Gemini API (Flash) | genuine ongoing free tier (~1,500 req/day), no card required — best zero-cost fit for a solo build |
| LLM orchestration | LangChain.js (Module 4 only) | reuse InHire's RAG patterns in JS; Modules 1, 2, 3's summary step, and 6 call the Gemini SDK directly — simpler, easier to defend in interviews |
| Auth | JWT | reuse InHire pattern |
| PDF export | `puppeteer` (render HTML → PDF) or `pdf-lib` | puppeteer easier for styled templates |
| Deploy | Render (backend + Postgres) + Vercel (frontend) | reuse AirGuard deploy experience |
| External APIs | Google Trends (unofficial endpoint via `axios`), Reddit API (`snoowrap` or raw fetch), HN Algolia API | all free tier |

**Known tradeoffs, stated upfront (not hidden):**
- No mature JS equivalent of Python's `pytrends`. You'll call Google Trends' unofficial endpoint directly and parse the response yourself — more work than the Python route, but not a blocker.
- Gemini's structured-output/function-calling support is slightly less refined than OpenAI/Anthropic in LangChain.js, and Gemini tends to add explanatory text around JSON unless the prompt is explicit about "return ONLY valid JSON" — expect extra prompt-tuning in Modules 1, 2, and 6.
- The code should stay provider-agnostic (the LLM call is isolated in `services/llm.ts`, swappable for OpenAI/Anthropic later) — worth calling out as a deliberate architecture decision, not just a cost-saving hack.

---

## 3. Database Schema (PostgreSQL, via Prisma)

Normalized relational design — SWOT items, personas, and signals each get their own table rather than being dumped into JSON columns, since the data has clear structure and relationships worth modeling properly.

```prisma
model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String
  createdAt    DateTime   @default(now())
  startups     Startup[]
}

model Startup {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  rawIdea     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  analysis      Analysis?
  businessPlan  BusinessPlan?
  marketReport  MarketReport?
  schemaDesign  SchemaDesign?
  pitchDeck     PitchDeck?
  mentorMessages MentorMessage[]
}

model Analysis {
  id                String   @id @default(uuid())
  startupId         String   @unique
  startup           Startup  @relation(fields: [startupId], references: [id])
  marketScore       Float
  difficultyScore   Float
  revenueScore      Float
  competitionLevel  String   // Low | Medium | High
  timeToBuildWeeks  Int
  recommendation    String
  reasoning         String   // chain-of-thought, stored for transparency
}

model BusinessPlan {
  id              String   @id @default(uuid())
  startupId       String   @unique
  startup         Startup  @relation(fields: [startupId], references: [id])
  mission         String
  vision          String
  usp             String
  targetAudience  String
  businessModel   String   // subscription | commission | freemium

  persona         Persona?
  swotItems       SwotItem[]
  revenueStreams  RevenueStream[]
  growthStrategy  String[] // Postgres text array
}

model Persona {
  id              String        @id @default(uuid())
  businessPlanId  String        @unique
  businessPlan    BusinessPlan  @relation(fields: [businessPlanId], references: [id])
  name            String
  ageRange        String
  behavior        String
  painPoints      PainPoint[]
}

model PainPoint {
  id         String   @id @default(uuid())
  personaId  String
  persona    Persona  @relation(fields: [personaId], references: [id])
  text       String
}

model SwotItem {
  id              String        @id @default(uuid())
  businessPlanId  String
  businessPlan    BusinessPlan  @relation(fields: [businessPlanId], references: [id])
  category        SwotCategory
  text            String
}
enum SwotCategory {
  STRENGTH
  WEAKNESS
  OPPORTUNITY
  THREAT
}

model RevenueStream {
  id              String        @id @default(uuid())
  businessPlanId  String
  businessPlan    BusinessPlan  @relation(fields: [businessPlanId], references: [id])
  name            String
  pricing         String
}

model MarketReport {
  id              String    @id @default(uuid())
  startupId       String    @unique
  startup         Startup   @relation(fields: [startupId], references: [id])
  trendDirection  String    // rising | flat | declining
  summary         String    // LLM-synthesized summary
  cachedAt        DateTime

  keywords        MarketKeyword[]
  redditSignals   RedditSignal[]
  hnSignals       HnSignal[]
}

model MarketKeyword {
  id              String        @id @default(uuid())
  marketReportId  String
  marketReport    MarketReport  @relation(fields: [marketReportId], references: [id])
  keyword         String
}

model RedditSignal {
  id              String        @id @default(uuid())
  marketReportId  String
  marketReport    MarketReport  @relation(fields: [marketReportId], references: [id])
  subreddit       String
  title           String
  sentiment       String   // positive | negative | neutral
  url             String
}

model HnSignal {
  id              String        @id @default(uuid())
  marketReportId  String
  marketReport    MarketReport  @relation(fields: [marketReportId], references: [id])
  title           String
  points           Int
  url             String
}

model MentorMessage {
  id          String   @id @default(uuid())
  startupId   String
  startup     Startup  @relation(fields: [startupId], references: [id])
  role        String   // user | assistant
  content     String
  createdAt   DateTime @default(now())
}

// Module 6 — Schema Generator. LLM returns entities+fields+relationships
// as JSON; stored raw here, converted to mermaid erDiagram syntax at
// render time by a pure function (no LLM call for the conversion step).
model SchemaDesign {
  id            String   @id @default(uuid())
  startupId     String   @unique
  startup       Startup  @relation(fields: [startupId], references: [id])
  entitiesJson  Json     // [{ name, fields: [{name, type}] }]
  relationsJson Json     // [{ from, to, type: "one-to-many" | "many-to-many" }]
  generatedAt   DateTime @default(now())
}

model PitchDeck {
  id            String    @id @default(uuid())
  startupId     String    @unique
  startup       Startup   @relation(fields: [startupId], references: [id])
  pdfUrl        String
  generatedAt   DateTime  @default(now())
}

// pgvector table — managed via raw SQL migration since Prisma doesn't
// natively support the vector type yet; add via a raw migration:
//
// CREATE EXTENSION IF NOT EXISTS vector;
// CREATE TABLE knowledge_chunks (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   startup_id UUID REFERENCES "Startup"(id),  -- NULL for shared/global knowledge base
//   source TEXT NOT NULL,          -- e.g. 'business_plan', 'market_report', 'curated_advice'
//   content TEXT NOT NULL,
//   embedding VECTOR(1536),        -- match your embedding model's dimension
//   created_at TIMESTAMP DEFAULT now()
// );
// CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);
```

---

## 4. API Design (Express/Fastify)

```
POST   /auth/register
POST   /auth/login

POST   /startups                        → create + trigger Module 1 (Idea Analyzer)
GET    /startups/:id                    → fetch full workspace (joins across tables)
GET    /startups                        → list user's startups

POST   /startups/:id/business           → run Module 2 (Business Generator)
PATCH  /startups/:id/business/:field    → regenerate single field (e.g. swot only)

POST   /startups/:id/market-research    → run Module 3 (async job, returns job id)
GET    /startups/:id/market-research/status

POST   /startups/:id/mentor/chat        → Module 4, RAG query via pgvector similarity search
GET    /startups/:id/mentor/history

POST   /startups/:id/schema             → Module 6, generates entities/fields/relationships JSON
GET    /startups/:id/schema             → fetch existing schema (JSON + rendered mermaid string)

POST   /startups/:id/pitch-deck         → Module 5, generates PDF, returns download URL
GET    /startups/:id/pitch-deck         → fetch existing deck
```

**Design notes:**
- Market Research is the slowest module (external API calls) — run it as a background job (BullMQ + Redis if you want a real queue to talk about, or a simple in-process async task if you want to keep infra minimal). Frontend polls `/status`.
- Every LLM call validated against a Zod schema before it's trusted/stored — never regex-parse raw LLM text.
- RAG retrieval: embed the query with the same model used to embed stored chunks, run a cosine similarity query against `knowledge_chunks` via pgvector's `<=>` operator, pull top-k chunks, inject into the LLM prompt, return answer + the source chunks used (for citations in the UI).

---

## 5. Module-by-Module Build Notes

### Module 1 — Idea Analyzer
- Single LLM call, temperature=0, few-shot examples in system prompt for score consistency across runs
- Store the reasoning trace in `Analysis.reasoning` — defends "how do you keep scores consistent" in interviews

### Module 2 — Business Generator
- One prompt per field group (mission/vision, persona, SWOT, growth) so `PATCH /business/:field` can regenerate independently
- Persona/PainPoints/SwotItems/RevenueStreams as separate tables means regenerating one section is a clean delete-and-reinsert on that table, not a partial JSON patch

### Module 3 — Market Research Engine
- Google Trends: call the unofficial endpoint directly via `axios`, parse response manually (no mature JS `pytrends` equivalent)
- Reddit: `snoowrap` (official API wrapper) or raw fetch against Reddit's OAuth API
- HN: Algolia HN Search API, no auth needed
- Cache via `cachedAt` — check before re-fetching within 24h
- LLM synthesis step turns raw pulled rows into the `summary` field — retrieval-then-generation, the strongest "not hallucinating" claim in the project

### Module 4 — AI Mentor (RAG)
- Embed and store: business plan text, market report text, plus a shared curated knowledge base (~50-100 chunks of startup advice, `startup_id = NULL`, reused across all users)
- pgvector similarity search scoped by `startup_id OR startup_id IS NULL` so per-startup context + shared knowledge base both surface
- Return the retrieved chunks alongside the LLM answer for citation display

### Module 5 — Pitch Deck Generator
- Fixed 10-slide HTML template, populated from `BusinessPlan` + `MarketReport` + `Analysis` — no new LLM calls except light rewriting for slide brevity
- Render via `puppeteer` (HTML → PDF), store output, return URL

### Module 6 — Schema Generator (new — generates a DB schema/UML for the *generated startup*, not for StartupForge itself)
- Input: the startup's idea + business model (already generated by Modules 1-2), so the LLM has context on what entities the hypothetical product needs
- LLM call, structured JSON output only: a list of entities (e.g. `User`, `Dog`, `Booking`, `Payment`) each with fields (`name` + `type`), plus a list of relationships (`from`, `to`, `type: one-to-many | many-to-many`) — validated with a `zod` schema before saving
- Store the raw JSON in `SchemaDesign` (editable/regeneratable later, same pattern as Module 2's fields)
- Convert JSON → mermaid `erDiagram` syntax with a small **pure function** (no LLM call for this step — string templating from validated data)
- Frontend renders the mermaid string as an ER diagram
- **Scope boundary, stated in README:** the LLM generates entities/fields/relationships only — not real indexes, constraints, or SQL migration scripts. That's a much harder, less reliable ask (original Module 8's full ambition) and is explicitly out of scope

---

## 6. Folder Structure

```
startupforge/
├── frontend/
│   ├── src/
│   │   ├── pages/          (Dashboard, Analyzer, Business, Market, Mentor, Schema, Deck)
│   │   ├── components/
│   │   ├── api/             (typed API client)
│   │   └── types/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/          (auth, startups, business, market, mentor, schema, deck)
│   │   ├── services/
│   │   │   ├── llm.ts
│   │   │   ├── marketApis.ts    (trends, reddit, hn)
│   │   │   ├── rag.ts           (pgvector queries)
│   │   │   ├── schemaToMermaid.ts  (pure JSON → erDiagram string converter)
│   │   │   └── pdfExport.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── config.ts
│   └── package.json
└── README.md               (honest scoping notes: no Crunchbase/PH, why)
```

---

## 7. Build Timeline (7-9 weeks, solo)

| Week | Focus |
|---|---|
| 1 | Auth, Prisma schema + migrations, project scaffolding, Module 1 (Idea Analyzer), Gemini API setup |
| 2 | Module 2 (Business Generator) + regenerable fields |
| 3-4 | Module 3 (Market Research) — expect most debugging time here (Trends parsing, Reddit auth, rate limits) |
| 5-6 | Module 4 (AI Mentor RAG) — pgvector setup + embedding pipeline, reuse InHire's RAG logic |
| 7 | Module 6 (Schema Generator) — LLM entity/relationship JSON + mermaid rendering |
| 8 | Module 5 (Pitch Deck PDF export) |
| 9 | Polish, deploy (Render + Vercel), write honest README, record demo |

---

## 8. Known Limitations to State Upfront (in README, not hidden)

- No Crunchbase or Product Hunt integration — paywalled / ToS-restrictive scraping, explicitly excluded
- Scores (market/difficulty/revenue) are LLM judgment calls, not trained ML models — framed as "AI-assisted estimate," not predictive analytics
- Google Trends integration relies on an unofficial endpoint (no official public API) — noted as a known fragility point
- Market Research summary quality depends on available Reddit/HN discussion — sparse-data ideas get thinner reports
- Generated database schemas (Module 6) cover entities, fields, and relationships only — not indexes, constraints, or runnable SQL migrations; framed as a starting point for a real schema, not a production artifact
- Gemini free tier is generous for a solo/demo project but not production-scale — noted as a deliberate cost tradeoff, with the LLM call isolated so a provider swap is a one-file change

---

## 9. Positioning on Resume

Once built, position as **"InHire, evolved"** rather than a separate project competing for a resume slot — same Node/TypeScript + RAG foundation as InHire, same Postgres discipline as AirGuard, extended to multi-source external retrieval, normalized relational schema design, pgvector-based RAG in a single database, and LLM-driven structured generation across six distinct output types (scores, business fields, market synthesis, chat, schema design, PDF). This range — not just RAG again — is what separates it from being "a second InHire." Consider replacing InHire's resume slot with this once complete, or explicitly note the progression in your project description so it reads as depth/growth rather than repetition.

It's also a full-stack project with AI as its core feature, same category as InHire — not "pure AI research." Lead with whichever half (architecture vs. RAG/generation) matches the keywords in a given job description.
