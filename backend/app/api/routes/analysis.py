import traceback
from fastapi import APIRouter, Depends, HTTPException
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
    try:
        return await analyze_ticket(payload.title, payload.description, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}\n{traceback.format_exc()}")
