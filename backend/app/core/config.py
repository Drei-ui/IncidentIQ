from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/incidentiq"

    # OpenAI
    OPENAI_API_KEY: str = ""
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    LLM_MODEL: str = "gpt-4o-mini"

    # App
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    VECTOR_DIMENSIONS: int = 1536

    class Config:
        env_file = ".env"


settings = Settings()
