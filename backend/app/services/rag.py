from openai import AsyncOpenAI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.schemas.analysis import AnalysisResponse, SimilarTicket, RelatedDocument
from app.services.embedding import embed

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = """You are an expert support engineer. Given a support ticket and relevant context,
provide a structured analysis. Be concise and actionable.

Respond in this exact JSON format:
{
  "possible_cause": "<root cause in one sentence>",
  "confidence": <integer 0-100>,
  "suggested_steps": ["<step 1>", "<step 2>", ...],
  "estimated_time": "<e.g. 5 minutes>"
}"""


async def analyze_ticket(
    title: str,
    description: str,
    db: AsyncSession,
) -> AnalysisResponse:
    query_text = f"{title}\n{description}"
    query_embedding = await embed(query_text)
    embedding_str = f"[{','.join(str(v) for v in query_embedding)}]"

    similar_tickets_result = await db.execute(
        text("""
            SELECT id, title, description, resolution,
                   1 - (embedding <=> :embedding::vector) AS score
            FROM tickets
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> :embedding::vector
            LIMIT 5
        """),
        {"embedding": embedding_str},
    )
    similar_rows = similar_tickets_result.fetchall()

    related_docs_result = await db.execute(
        text("""
            SELECT id, document_name, content,
                   1 - (embedding <=> :embedding::vector) AS score
            FROM knowledge_chunks
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> :embedding::vector
            LIMIT 5
        """),
        {"embedding": embedding_str},
    )
    related_rows = related_docs_result.fetchall()

    context_parts = []
    if similar_rows:
        context_parts.append("Similar past tickets:")
        for row in similar_rows:
            context_parts.append(f"- {row.title}: {row.resolution or 'No resolution recorded'}")

    if related_rows:
        context_parts.append("\nRelevant knowledge base:")
        for row in related_rows:
            context_parts.append(f"- [{row.document_name}]: {row.content[:300]}")

    context = "\n".join(context_parts)

    user_message = f"Ticket: {title}\n\nDescription: {description}\n\nContext:\n{context}"

    import json
    response = await client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    ai_result = json.loads(response.choices[0].message.content)

    return AnalysisResponse(
        possible_cause=ai_result["possible_cause"],
        confidence=ai_result["confidence"],
        suggested_steps=ai_result["suggested_steps"],
        estimated_time=ai_result["estimated_time"],
        similar_tickets=[
            SimilarTicket(
                id=row.id,
                title=row.title,
                description=row.description,
                resolution=row.resolution,
                similarity_score=round(float(row.score), 3),
            )
            for row in similar_rows
        ],
        related_documents=[
            RelatedDocument(
                id=row.id,
                document_name=row.document_name,
                content=row.content,
                similarity_score=round(float(row.score), 3),
            )
            for row in related_rows
        ],
    )
