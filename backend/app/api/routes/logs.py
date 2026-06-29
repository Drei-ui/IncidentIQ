import traceback
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.log_analysis import LogAnalysisResponse
from app.services.log_analyzer import analyze_logs

router = APIRouter()

ALLOWED_EXTENSIONS = {".log", ".txt"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/analyze", response_model=LogAnalysisResponse)
async def analyze_log_file(file: UploadFile = File(...)):
    suffix = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only .log and .txt files are supported")

    raw = await file.read()
    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5 MB")

    content = raw.decode("utf-8", errors="ignore")
    if not content.strip():
        raise HTTPException(status_code=400, detail="File is empty")

    try:
        return analyze_logs(file.filename, content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}\n{traceback.format_exc()}")
