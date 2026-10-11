from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

settings = get_settings()

_connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, pool_pre_ping=True, connect_args=_connect_args)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Базовый класс для всех моделей SQLAlchemy."""


def get_db() -> Generator[Session, None, None]:
    """Зависимость FastAPI: выдаёт сессию БД на время запроса и закрывает её после."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
