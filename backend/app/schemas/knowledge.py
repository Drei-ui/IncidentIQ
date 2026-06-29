from datetime import datetime
from pydantic import BaseModel
from app.models.knowledge import DocumentType


class KnowledgeChunkResponse(BaseModel):
    id: str
    document_name: str
    document_type: DocumentType
    content: str
    chunk_index: int
    created_at: datetime

    model_config = {"from_attributes": True}


class KnowledgeUploadResponse(BaseModel):
    document_name: str
    chunks_created: int
