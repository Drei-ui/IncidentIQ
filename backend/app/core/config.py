from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/incidentiq"

    # Anthropic
    ANTHROPIC_API_KEY: str = ""
    LLM_MODEL: str = "claude-haiku-4-5-20251001"

    # Embeddings (fastembed — runs locally, no API key needed)
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    VECTOR_DIMENSIONS: int = 384

    # Email (Resend)
    RESEND_API_KEY: str = ""
    ALERT_EMAIL_TO: str = ""
    ALERT_EMAIL_FROM: str = "IncidentIQ <alerts@incidentiq.dev>"

    # App
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
