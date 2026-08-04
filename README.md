# StartupForge AI

**AI-Powered Startup Analysis & Launch Platform**

🌐 **Live Deployment** — _Coming soon (deployment in progress)_

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-black?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-API-8E75B2?logo=google&logoColor=white)
![RAG](https://img.shields.io/badge/RAG-Vector_Search-orange)
![JWT](https://img.shields.io/badge/Auth-JWT-black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animation-EF008F?logo=framer&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Frontend-Cloudflare_Pages-F38020?logo=cloudflare&logoColor=white)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

_Idea Analysis • Business Planning • Market Research • Schema Design • Pitch Decks • AI Mentor (RAG)_

[Features](#-features) · [Demo Flow](#-demo-flow) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference)

---

## Overview

StartupForge AI is a full-stack AI platform that turns a single one-line startup idea into a complete, investor-ready toolkit. Instead of bouncing between spreadsheets, generic templates, and separate design tools, a founder describes their idea once and the platform generates a scored analysis, a full business plan, live market research, a database schema, and an investor pitch deck — all in one place.

The application consists of a **React + TypeScript frontend**, a **Node.js/Express backend**, a **PostgreSQL database (with the pgvector extension)** accessed through **Prisma ORM**, and the **Google Gemini API** for both content generation and embeddings. Its core differentiator is an **AI Mentor** built on **Retrieval-Augmented Generation (RAG)**: every founder's own generated data is embedded and stored as vectors, so the mentor's answers are grounded in that specific startup rather than generic advice.

## ✨ Features

**Six AI Modules**
- 🧠 **Idea Analyzer** — instant market, difficulty & revenue scoring with transparent reasoning
- 📄 **Business Plan Generator** — mission, vision, USP, customer persona, SWOT, revenue streams, growth strategy
- 📈 **Market Research** — live Hacker News signal synthesis with honest trend direction (24-hour caching)
- 🗄️ **Schema Designer** — LLM-generated entity/relationship schema rendered as an interactive Mermaid ER diagram
- ⚡ **Pitch Deck Generator** — 6-slide investor-ready deck, exported as a PDF entirely client-side
- 💬 **AI Mentor (RAG)** — multi-turn chat grounded in the founder's own business plan, market data & curated startup advice via vector similarity search

**Platform**
- JWT authentication with rotating refresh tokens & reuse detection
- Email verification and password reset via one-time codes
- Per-user, per-endpoint AI usage & token tracking
- Persisted module results — generate once, revisit anytime, regenerate on demand
- Fully responsive, animated UI with dark/light themes

## 🎬 Demo Flow

1. Sign up → verify email with a 6-digit code → land on the dashboard
2. Describe a startup idea in one sentence → get an instant scored analysis
3. Generate a business plan, market research, schema, and pitch deck for that idea
4. Sync knowledge → chat with the AI Mentor about that specific startup
5. Track progress and activity across every idea from the dashboard

## 🏗️ Architecture

```
                         React + TypeScript + Vite
                                    │
                          REST API (HTTPS + JWT)
                                    │
                        Node.js + Express (TypeScript)
                                    │
                                Prisma ORM
                                    │
                            PostgreSQL (Neon)
                                    │
             ┌──────────────────────┴──────────────────────┐
             │                                              │
     Auth & Usage Services                          Six AI Modules
                                                              │
                                                    Idea Analyzer
                                                    Business Plan Generator
                                                    Market Research
                                                    Schema Designer
                                                    Pitch Deck Generator
                                                    AI Mentor (RAG)
                                                              │
                                                   Google Gemini API
                                              (gemini-flash-latest)
                                                              │
                                             gemini-embedding-001
                                               (768-dim embeddings)
                                                              │
                                           pgvector Knowledge Store
                                          (cosine-similarity search)
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | UI |
| Styling | Tailwind CSS | Design system |
| Animation | Framer Motion | Motion & transitions |
| Diagrams | Mermaid.js | ER diagram rendering |
| Charts | Recharts | Usage & activity visualizations |
| PDF Export | jsPDF | Client-side pitch deck generation |
| Backend | Node.js + Express | REST API |
| Database | PostgreSQL (Neon) | Data storage |
| ORM | Prisma | Type-safe database access |
| Vector Search | pgvector | RAG retrieval (cosine similarity) |
| Authentication | JWT + bcrypt | Auth & password hashing |
| AI | Google Gemini API | Generation + embeddings |
| Email | Nodemailer (SMTP) | Verification & reset codes |
| Market Data | Hacker News (Algolia) API | Live market signals |
| Frontend Hosting | Cloudflare Pages | Static deployment |
| Backend Hosting | Render | Node server deployment |

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL with the `pgvector` extension (a free [Neon](https://neon.tech) instance works well)
- A Google Gemini API key
- npm

### Installation

```bash
git clone https://github.com/SakshamxMidha/Startup-Forge.git
cd Startup-Forge
```

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, etc.
npx prisma generate
npx prisma migrate dev
npm run dev             # runs on http://localhost:4000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev              # runs on http://localhost:5173
```

The frontend dev server proxies `/api` to the backend, so no CORS setup is needed locally.

## 📡 API Reference

**Auth**
```
POST   /auth/signup
POST   /auth/verify-email
POST   /auth/login
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
```

**User**
```
GET    /me
GET    /usage
```

**Startups**
```
POST   /startups
GET    /startups
GET    /startups/:id
```

**Modules** _(each has a matching `GET` to load a saved result, and the `POST` both generates and regenerates)_
```
POST   /startups/:id/business-plan      GET /startups/:id/business-plan
POST   /startups/:id/market-research    GET /startups/:id/market-research
POST   /startups/:id/schema-design      GET /startups/:id/schema-design
POST   /startups/:id/pitch-deck         GET /startups/:id/pitch-deck
```

**AI Mentor**
```
POST   /startups/:id/ingest-knowledge
POST   /startups/:id/mentor/chat
GET    /startups/:id/mentor/history
```

## 📁 Project Structure

```
frontend/
  src/
    components/
      ui/           # Button, Card, Input, Modal, ScoreRing…
      layout/       # AppShell, PageHeader, AuthLayout
      startup/      # Per-module views (Analysis, Plan, Schema…)
      fx/           # Katana, FallingLeaves ambient visuals
    pages/
    context/        # Auth & Theme providers
    lib/            # Typed API client
    types/
backend/
  src/
    routes/
    services/       # Per-module Gemini generation services
    middleware/      # Auth, rate limiting
    lib/
  prisma/
    schema.prisma
    migrations/
README.md
```

## 🧠 AI Mentor — RAG Pipeline

```
Founder's Business Plan & Market Report
              ↓
          Chunking
              ↓
   Gemini Embeddings (768-dim)
              ↓
     pgvector Storage
              ↓
      Founder's Question
              ↓
      Query Embedding
              ↓
  Cosine Similarity Search (top-k)
              ↓
Retrieved Context + Conversation History + Raw Idea
              ↓
       Gemini Generation
              ↓
      Grounded Mentor Reply
```

## 🔒 Security

- JWT Authentication — short-lived access tokens + rotating refresh tokens with reuse detection & mass session revocation
- bcrypt password hashing
- Email verification & one-time password reset codes
- Rate limiting middleware (auth & LLM endpoints)
- Schema-validated AI responses (Zod) before persistence
- Protected REST APIs with per-request ownership checks

## 👨‍💻 Author

**Saksham Midha**
GitHub: [SakshamxMidha](https://github.com/SakshamxMidha)

## ⭐ Support

If you found this project useful, consider giving it a ⭐.
