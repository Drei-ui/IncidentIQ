from pydantic import BaseModel


class SimilarTicket(BaseModel):
    id: str
    title: str
    description: str
    resolution: str | None
    similarity_score: float


class RelatedDocument(BaseModel):
    id: str
    document_name: str
    content: str
    similarity_score: float


class AnalysisResponse(BaseModel):
    possible_cause: str
    confidence: int
    suggested_steps: list[str]
    estimated_time: str
    similar_tickets: list[SimilarTicket]
    related_documents: list[RelatedDocument]
