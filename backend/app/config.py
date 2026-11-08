from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Настройки приложения. Значения берутся из переменных окружения / файла .env."""

    # Обязательный параметр: без него приложение не запустится
    # (так секреты не попадают в код и в репозиторий).
    database_url: str

    # Секрет для подписи JWT. Обязательный, не короче 32 символов, в репозиторий не попадает.
    # Сгенерировать: python -c "import secrets; print(secrets.token_urlsafe(48))"
    secret_key: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 15
    refresh_token_days: int = 7

    upload_dir: str = "uploads"
    max_upload_mb: int = 5
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()