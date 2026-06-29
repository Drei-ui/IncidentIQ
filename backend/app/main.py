from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import tickets, knowledge, analysis
from app.core.config import settings

app = FastAPI(
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


@app.get("/health")
def health_check():
    return {"status": "ok"}
