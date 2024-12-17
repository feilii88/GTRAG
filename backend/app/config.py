from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Required settings
    PG_DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    FRONTEND_URL: str

    OPENAI_API_KEY: str

    MAILERSEND_API_KEY: str
    EMAIL_TEMPLATE_SIGNUP: str


@lru_cache
def get_settings():
    return Settings()

constants = get_settings()