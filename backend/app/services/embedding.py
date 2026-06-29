from fastembed import TextEmbedding
from app.core.config import settings

# Loaded once at module level — model is cached to disk after first download (~45MB)
_model = TextEmbedding(model_name=settings.EMBEDDING_MODEL)


def embed(text: str) -> list[float]:
    return next(_model.embed([text])).tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    return [v.tolist() for v in _model.embed(texts)]
