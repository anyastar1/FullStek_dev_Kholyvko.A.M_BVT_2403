"""Регистрация, вход, токены, выход и разграничение прав."""

from datetime import datetime, timedelta, timezone

import jwt
from sqlalchemy import update

from app import models
from app.config import get_settings
from app.database import get_db
from app.main import app
from tests.conftest import PASSWORD, bearer, register


def _db(client):
    return next(app.dependency_overrides[get_db]())


# ---------- Регистрация ----------


def test_register_returns_tokens_and_user(client):
    body = register(client, email="Bob@Example.com", name=" Боб ")
    assert body["token_type"] == "bearer" and body["expires_in"] > 0
    assert body["access_token"] and body["refresh_token"]
    assert body["user"]["email"] == "bob@example.com"  # email приводится к нижнему регистру
    assert body["user"]["name"] == "Боб"
    assert "password" not in body["user"] and "password_hash" not in body["user"]


def test_password_is_stored_as_hash(client):
    register(client)
    db = _db(client)
    stored = db.query(models.User).one().password_hash
    assert stored != PASSWORD and PASSWORD not in stored
    assert stored.startswith("$argon2id$")  # стойкий хеш для паролей, соль внутри строки


def test_same_password_gives_different_hashes(client):
    register(client, email="a@example.com")
    register(client, email="b@example.com")
    hashes = [u.password_hash for u in _db(client).query(models.User).all()]
    assert hashes[0] != hashes[1]  # у каждого хеша своя соль


def test_register_duplicate_email_returns_409(client, session):
    response = client.post(
        "/auth/register", json={"email": "ANNA@example.com", "name": "Другая", "password": PASSWORD}
    )
    assert response.status_code == 409


def test_register_validation(client):
    ok = {"email": "a@b.ru", "name": "X", "password": PASSWORD}
    assert client.post("/auth/register", json={**ok, "password": "short"}).status_code == 422
    assert client.post("/auth/register", json={**ok, "email": "not-an-email"}).status_code == 422
    assert client.post("/auth/register", json={**ok, "name": "   "}).status_code == 422
    assert client.post("/auth/register", json={**ok, "phone": "abc"}).status_code == 422
    assert client.post("/auth/register", json={k: v for k, v in ok.items() if k != "password"}).status_code == 422


# ---------- Вход ----------


def test_login_success(client, session):
    response = client.post("/auth/login", json={"email": "ANNA@example.com", "password": PASSWORD})
    assert response.status_code == 200
    assert response.json()["user"]["id"] == session["user"]["id"]


def test_login_wrong_password_and_unknown_email_look_the_same(client, session):
    wrong = client.post("/auth/login", json={"email": "anna@example.com", "password": "wrong-password"})
    unknown = client.post("/auth/login", json={"email": "nobody@example.com", "password": PASSWORD})
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()  # нельзя понять, какие email зарегистрированы
    assert wrong.headers["www-authenticate"] == "Bearer"


def test_login_form_for_swagger(client, session):
    response = client.post("/auth/token", data={"username": "anna@example.com", "password": PASSWORD})
    assert response.status_code == 200 and response.json()["access_token"]


# ---------- Access token и защищённые маршруты ----------


def test_me_requires_valid_token(client, session):
    assert client.get("/auth/me").status_code == 401
    assert client.get("/auth/me", headers={"Authorization": "Bearer garbage"}).status_code == 401
    me = client.get("/auth/me", headers=bearer(session))
    assert me.status_code == 200 and me.json()["email"] == "anna@example.com"


def test_access_token_is_jwt_with_expiry(client, session):
    settings = get_settings()
    payload = jwt.decode(session["access_token"], settings.secret_key, algorithms=[settings.jwt_algorithm])
    assert payload["sub"] == str(session["user"]["id"]) and payload["type"] == "access"
    lifetime = payload["exp"] - payload["iat"]
    assert lifetime == settings.access_token_minutes * 60


def test_expired_access_token_is_rejected(client, session):
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expired = jwt.encode(
        {"sub": str(session["user"]["id"]), "type": "access", "iat": now - timedelta(hours=2), "exp": now - timedelta(hours=1)},
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )
    assert client.get("/auth/me", headers={"Authorization": f"Bearer {expired}"}).status_code == 401


def test_token_signed_with_other_key_is_rejected(client, session):
    now = datetime.now(timezone.utc)
    forged = jwt.encode(
        {"sub": str(session["user"]["id"]), "type": "access", "exp": now + timedelta(hours=1)},
        "another-secret-key-another-secret-key-0000",
        algorithm="HS256",
    )
    assert client.get("/auth/me", headers={"Authorization": f"Bearer {forged}"}).status_code == 401


def test_refresh_token_cannot_be_used_as_access_token(client, session):
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {session['refresh_token']}"})
    assert response.status_code == 401


def test_private_routes_require_authentication(client, user, listing_payload):
    assert client.get(f"/users/{user['id']}").status_code == 401
    assert client.post(f"/users/{user['id']}/pets", json={"name": "Х", "species": "dog"}).status_code == 401
    assert client.get("/pets/1").status_code == 401
    assert client.post("/listings", json=listing_payload).status_code == 401
    assert client.patch("/listings/1", json={"city": "X"}).status_code == 401
    assert client.delete("/listings/1").status_code == 401


def test_public_routes_work_without_token(client):
    assert client.get("/health").status_code == 200
    assert client.get("/listings").status_code == 200


# ---------- Права на чужие данные ----------


def test_cannot_touch_another_users_profile_and_pets(client, user, headers, other_session):
    other_headers = bearer(other_session)
    other_id = other_session["user"]["id"]

    assert client.get(f"/users/{other_id}", headers=headers).status_code == 403
    assert client.patch(f"/users/{other_id}", json={"name": "Взлом"}, headers=headers).status_code == 403
    assert client.delete(f"/users/{other_id}", headers=headers).status_code == 403
    assert client.get(f"/users/{other_id}/pets", headers=headers).status_code == 403
    assert client.post(f"/users/{other_id}/pets", json={"name": "Х", "species": "dog"}, headers=headers).status_code == 403

    pet = client.post(f"/users/{other_id}/pets", json={"name": "Чужой", "species": "dog"}, headers=other_headers).json()
    assert client.get(f"/pets/{pet['id']}", headers=headers).status_code == 403
    assert client.patch(f"/pets/{pet['id']}", json={"name": "Х"}, headers=headers).status_code == 403
    assert client.delete(f"/pets/{pet['id']}", headers=headers).status_code == 403
    assert (
        client.post(f"/pets/{pet['id']}/photos", files={"file": ("a.png", b"x", "image/png")}, headers=headers).status_code
        == 403
    )
    # владелец по-прежнему имеет доступ
    assert client.get(f"/pets/{pet['id']}", headers=other_headers).status_code == 200


def test_cannot_edit_or_delete_another_users_listing(client, headers, listing_payload, other_session):
    listing = client.post("/listings", json=listing_payload, headers=headers).json()
    other_headers = bearer(other_session)

    assert client.patch(f"/listings/{listing['id']}", json={"city": "Хак"}, headers=other_headers).status_code == 403
    assert client.delete(f"/listings/{listing['id']}", headers=other_headers).status_code == 403
    assert client.get(f"/listings/{listing['id']}").json()["city"] == "Москва"


def test_inactive_listings_only_for_their_author(client, user, headers, listing_payload, other_session):
    client.post("/listings", json={**listing_payload}, headers=headers)
    assert client.get("/listings", params={"include_inactive": True}).status_code == 403
    assert client.get("/listings", params={"include_inactive": True}, headers=headers).status_code == 403  # без author_id
    other = client.get(
        "/listings", params={"include_inactive": True, "author_id": user["id"]}, headers=bearer(other_session)
    )
    assert other.status_code == 403


# ---------- Refresh token ----------


def test_refresh_issues_new_pair_and_old_refresh_stops_working(client, session):
    first = session["refresh_token"]
    response = client.post("/auth/refresh", json={"refresh_token": first})
    assert response.status_code == 200
    pair = response.json()
    assert pair["refresh_token"] != first and pair["access_token"]
    assert client.get("/auth/me", headers={"Authorization": f"Bearer {pair['access_token']}"}).status_code == 200

    # старый токен одноразовый
    assert client.post("/auth/refresh", json={"refresh_token": first}).status_code == 401


def test_reusing_old_refresh_revokes_the_whole_session(client, session):
    first = session["refresh_token"]
    second = client.post("/auth/refresh", json={"refresh_token": first}).json()["refresh_token"]
    # повторное предъявление уже использованного токена = подозрение на кражу
    assert client.post("/auth/refresh", json={"refresh_token": first}).status_code == 401
    # и «свежий» токен той же сессии тоже перестал работать
    assert client.post("/auth/refresh", json={"refresh_token": second}).status_code == 401


def test_refresh_rejects_invalid_token(client):
    assert client.post("/auth/refresh", json={"refresh_token": "not-a-real-token"}).status_code == 401
    assert client.post("/auth/refresh", json={"refresh_token": ""}).status_code == 422
    assert client.post("/auth/refresh", json={}).status_code == 422


def test_refresh_rejects_expired_token(client, session):
    db = _db(client)
    db.execute(update(models.RefreshToken).values(expires_at=datetime.now(timezone.utc) - timedelta(seconds=1)))
    db.commit()
    response = client.post("/auth/refresh", json={"refresh_token": session["refresh_token"]})
    assert response.status_code == 401
    assert "истёк" in response.json()["detail"]


def test_refresh_token_is_stored_only_as_hash(client, session):
    stored = _db(client).query(models.RefreshToken).one()
    assert stored.token_hash != session["refresh_token"]
    assert len(stored.token_hash) == 64


# ---------- Выход ----------


def test_logout_revokes_refresh_token(client, session):
    assert client.post("/auth/logout", json={"refresh_token": session["refresh_token"]}).status_code == 204
    assert client.post("/auth/refresh", json={"refresh_token": session["refresh_token"]}).status_code == 401


def test_logout_revokes_tokens_issued_by_refresh_in_same_session(client, session):
    newer = client.post("/auth/refresh", json={"refresh_token": session["refresh_token"]}).json()
    client.post("/auth/logout", json={"refresh_token": newer["refresh_token"]})
    assert client.post("/auth/refresh", json={"refresh_token": newer["refresh_token"]}).status_code == 401


def test_logout_affects_only_current_session(client, session):
    # второй вход того же пользователя (другое устройство) — отдельная сессия
    other_device = client.post("/auth/login", json={"email": "anna@example.com", "password": PASSWORD}).json()
    client.post("/auth/logout", json={"refresh_token": session["refresh_token"]})
    assert client.post("/auth/refresh", json={"refresh_token": other_device["refresh_token"]}).status_code == 200


def test_logout_is_idempotent(client, session):
    for _ in range(2):
        assert client.post("/auth/logout", json={"refresh_token": session["refresh_token"]}).status_code == 204
    assert client.post("/auth/logout", json={"refresh_token": "unknown-token"}).status_code == 204
