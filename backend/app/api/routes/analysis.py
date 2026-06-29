from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.analysis import AnalysisResponse
from app.services.rag import analyze_ticket

router = APIRouter()


class AnalysisRequest(BaseModel):
    title: str
    description: str


@router.post("/", response_model=AnalysisResponse)
async def run_analysis(
    payload: AnalysisRequest,
    db: AsyncSession = Depends(get_db),
):
    return await analyze_ticket(payload.title, payload.description, db)
