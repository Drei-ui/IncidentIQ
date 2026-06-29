from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import tickets, knowledge, analysis, logs
from app.core.config import settings
from app.db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="IncidentIQ API",
    version="0.1.0",
    description="AI-powered ticket resolution assistant",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets.router, prefix="/api/tickets", tags=["tickets"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["knowledge"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(logs.router, prefix="/api/logs", tags=["logs"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
