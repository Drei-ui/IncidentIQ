import io
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.knowledge import KnowledgeChunk, DocumentType
from app.schemas.knowledge import KnowledgeUploadResponse, KnowledgeChunkResponse
from app.services.chunker import chunk_text
from app.services.embedding import embed_batch

router = APIRouter()


@router.post("/upload", response_model=KnowledgeUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: DocumentType = Form(DocumentType.other),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename.endswith((".txt", ".md")):
        raise HTTPException(status_code=400, detail="Only .txt and .md files are supported currently")

    raw = await file.read()
    text = raw.decode("utf-8", errors="ignore")
    chunks = chunk_text(text)

    if not chunks:
        raise HTTPException(status_code=400, detail="File appears to be empty")

    embeddings = embed_batch(chunks)

    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        db.add(KnowledgeChunk(
            document_name=file.filename,
            document_type=document_type,
            content=chunk,
            chunk_index=i,
            embedding=embedding,
        ))

    await db.commit()
    return KnowledgeUploadResponse(document_name=file.filename, chunks_created=len(chunks))


@router.get("/", response_model=list[KnowledgeChunkResponse])
async def list_documents(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select, distinct
    result = await db.execute(
        select(KnowledgeChunk).distinct(KnowledgeChunk.document_name)
    )
    return result.scalars().all()
