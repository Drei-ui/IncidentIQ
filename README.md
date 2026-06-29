# IncidentIQ

AI-powered ticket resolution assistant. Submit a support ticket, get instant root-cause analysis, suggested fix steps, similar past tickets, and relevant knowledge base documents — powered by RAG + OpenAI.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, TanStack Query |
| Backend | FastAPI, SQLAlchemy (async), pgvector |
| AI | OpenAI `text-embedding-3-small` + `gpt-4o-mini` |
| Database | PostgreSQL 16 + pgvector |
| Dev infra | Docker Compose |

## Quick Start

### 1. Start the database

```bash
docker compose up -d
```

### 2. Start the backend

```bash
cd backend
cp .env.example .env          # add your OPENAI_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs available at http://localhost:8000/docs

### 3. Start the frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

App available at http://localhost:3000

## Project Structure

```
IncidentIQ/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # tickets, knowledge, analysis endpoints
│   │   ├── core/            # config / settings
│   │   ├── db/              # SQLAlchemy setup
│   │   ├── models/          # Ticket, KnowledgeChunk
│   │   ├── schemas/         # Pydantic request/response models
│   │   └── services/        # embedding, chunking, RAG pipeline
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── app/             # Next.js app router
│       ├── components/      # StatsBar, TicketList, AnalysisPanel, etc.
│       ├── lib/             # API client, utils
│       └── types/           # TypeScript types
└── docker-compose.yml
```
