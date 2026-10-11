import os
import tempfile

_UPLOADS = tempfile.mkdtemp(prefix="nashlis_test_uploads_")
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["UPLOAD_DIR"] = _UPLOADS

import pytest 
from fastapi.testclient import TestClient  
from sqlalchemy import create_engine  
from sqlalchemy.orm import sessionmaker  
from sqlalchemy.pool import StaticPool  

from app.database import Base, get_db  
from app.main import app 


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


@pytest.fixture()
def user(client):
    response = client.post("/users", json={"email": "anna@example.com", "name": "Анна", "city": "Москва"})
    assert response.status_code == 201
    return response.json()


@pytest.fixture()
def listing_payload(user):
    return {
        "author_id": user["id"],
        "status": "lost",
        "species": "cat",
        "name": "Рыжик",
        "city": "Москва",
        "event_date": "2026-09-05",
        "description": "Пропал возле дома",
        "contact_name": "Анна",
        "contact_phone": "+7 900 111-22-33",
    }
