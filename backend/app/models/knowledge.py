import uuid
from datetime import datetime, UTC
from enum import Enum

from sqlalchemy import String, Text, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector

from app.db.database import Base
from app.core.config import settings


class DocumentType(str, Enum):
    sop = "sop"
    runbook = "runbook"
    api_doc = "api_doc"
    previous_ticket = "previous_ticket"
    other = "other"


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_name: Mapped[str] = mapped_column(String(500))
    document_type: Mapped[DocumentType] = mapped_column(SAEnum(DocumentType), default=DocumentType.other)
    content: Mapped[str] = mapped_column(Text)
    chunk_index: Mapped[int] = mapped_column(default=0)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(settings.VECTOR_DIMENSIONS), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
