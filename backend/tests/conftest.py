import os
import tempfile

# Переменные окружения должны быть заданы ДО импорта приложения.
_UPLOADS = tempfile.mkdtemp(prefix="nashlis_test_uploads_")
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["UPLOAD_DIR"] = _UPLOADS
os.environ["SECRET_KEY"] = "test-secret-key-for-pytest-only-0123456789abcdef"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture()
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)


PASSWORD = "correct-horse-battery"


def register(client, email="anna@example.com", name="Анна", **extra):
    """Регистрирует пользователя и возвращает тело ответа (токены + user)."""
    response = client.post(
        "/auth/register", json={"email": email, "name": name, "password": PASSWORD, "city": "Москва", **extra}
    )
    assert response.status_code == 201, response.text
    return response.json()


def bearer(session: dict) -> dict:
    return {"Authorization": f"Bearer {session['access_token']}"}


@pytest.fixture()
def session(client):
    """Зарегистрированный пользователь Анна с токенами."""
    return register(client)


@pytest.fixture()
def user(session):
    return session["user"]


@pytest.fixture()
def headers(session):
    """Заголовок авторизации Анны."""
    return bearer(session)


@pytest.fixture()
def other_session(client):
    """Второй пользователь для проверки прав на чужие данные."""
    return register(client, email="boris@example.com", name="Борис")


@pytest.fixture()
def listing_payload():
    return {
        "status": "lost",
        "species": "cat",
        "name": "Рыжик",
        "city": "Москва",
        "event_date": "2026-09-05",
        "description": "Пропал возле дома",
        "contact_name": "Анна",
        "contact_phone": "+7 900 111-22-33",
    }
