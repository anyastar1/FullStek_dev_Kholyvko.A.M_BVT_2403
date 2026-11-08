"""Проверка CRUD, валидации, кодов ошибок и связанных записей (все приватные запросы идут с токеном)."""

PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 32


# ---------- Пользователи ----------


def test_user_profile_read_update_delete(client, user, headers):
    assert client.get(f"/users/{user['id']}", headers=headers).json()["name"] == "Анна"

    updated = client.patch(f"/users/{user['id']}", json={"city": "Казань"}, headers=headers)
    assert updated.status_code == 200 and updated.json()["city"] == "Казань"

    assert client.delete(f"/users/{user['id']}", headers=headers).status_code == 204
    # после удаления аккаунта токен больше не работает
    assert client.get("/auth/me", headers=headers).status_code == 401


def test_update_email_to_taken_returns_409(client, user, headers, other_session):
    response = client.patch(f"/users/{user['id']}", json={"email": "BORIS@example.com"}, headers=headers)
    assert response.status_code == 409


def test_user_response_never_contains_password(client, user, headers):
    body = client.get(f"/users/{user['id']}", headers=headers).json()
    assert "password" not in body and "password_hash" not in body


def test_non_integer_id_returns_422(client, headers):
    assert client.get("/users/abc", headers=headers).status_code == 422


# ---------- Питомцы и фото ----------


def test_pet_crud(client, user, headers):
    created = client.post(f"/users/{user['id']}/pets", json={"name": "Барсик", "species": "cat"}, headers=headers)
    assert created.status_code == 201
    pet = created.json()
    assert pet["owner_id"] == user["id"] and pet["photos"] == []

    assert client.get(f"/users/{user['id']}/pets", headers=headers).json()[0]["id"] == pet["id"]
    assert client.get(f"/pets/{pet['id']}", headers=headers).json()["name"] == "Барсик"
    patched = client.patch(f"/pets/{pet['id']}", json={"color": "серый"}, headers=headers)
    assert patched.json()["color"] == "серый"
    assert client.delete(f"/pets/{pet['id']}", headers=headers).status_code == 204
    assert client.get(f"/pets/{pet['id']}", headers=headers).status_code == 404


def test_invalid_species_returns_422(client, user, headers):
    response = client.post(f"/users/{user['id']}/pets", json={"name": "Х", "species": "dragon"}, headers=headers)
    assert response.status_code == 422


def test_photo_upload_and_delete(client, user, headers):
    pet = client.post(f"/users/{user['id']}/pets", json={"name": "Барсик", "species": "cat"}, headers=headers).json()

    uploaded = client.post(
        f"/pets/{pet['id']}/photos", files={"file": ("cat.png", PNG, "image/png")}, headers=headers
    )
    assert uploaded.status_code == 201
    photo = uploaded.json()
    assert photo["url"].startswith("/uploads/")

    assert client.get(photo["url"]).status_code == 200  # файл отдаётся статикой
    assert len(client.get(f"/pets/{pet['id']}", headers=headers).json()["photos"]) == 1

    assert client.delete(f"/pets/{pet['id']}/photos/{photo['id']}", headers=headers).status_code == 204
    assert client.get(f"/pets/{pet['id']}", headers=headers).json()["photos"] == []
    assert client.delete(f"/pets/{pet['id']}/photos/{photo['id']}", headers=headers).status_code == 404


def test_photo_upload_rejects_wrong_type_and_missing_pet(client, user, headers):
    pet = client.post(f"/users/{user['id']}/pets", json={"name": "Барсик", "species": "cat"}, headers=headers).json()
    bad = client.post(f"/pets/{pet['id']}/photos", files={"file": ("a.txt", b"hello", "text/plain")}, headers=headers)
    assert bad.status_code == 415
    missing = client.post("/pets/999/photos", files={"file": ("cat.png", PNG, "image/png")}, headers=headers)
    assert missing.status_code == 404


# ---------- Объявления ----------


def test_listing_crud_and_public_read(client, user, headers, listing_payload):
    created = client.post("/listings", json=listing_payload, headers=headers)
    assert created.status_code == 201
    listing = created.json()
    assert listing["is_active"] is True
    assert listing["author_id"] == user["id"]  # автор берётся из токена

    # чтение публичное: без токена
    assert client.get(f"/listings/{listing['id']}").json()["name"] == "Рыжик"
    assert len(client.get("/listings").json()) == 1

    patched = client.patch(
        f"/listings/{listing['id']}", json={"description": "Нашёлся!", "is_active": False}, headers=headers
    )
    assert patched.status_code == 200 and patched.json()["is_active"] is False

    # снятое с публикации объявление скрыто для всех, кроме автора
    assert client.get("/listings").json() == []
    assert client.get(f"/listings/{listing['id']}").status_code == 404
    assert client.get(f"/listings/{listing['id']}", headers=headers).status_code == 200
    own = client.get("/listings", params={"include_inactive": True, "author_id": user["id"]}, headers=headers)
    assert len(own.json()) == 1

    assert client.delete(f"/listings/{listing['id']}", headers=headers).status_code == 204
    assert client.get(f"/listings/{listing['id']}", headers=headers).status_code == 404


def test_listing_filters(client, headers, listing_payload):
    client.post("/listings", json=listing_payload, headers=headers)
    client.post(
        "/listings",
        json={**listing_payload, "status": "found", "species": "dog", "city": "Казань"},
        headers=headers,
    )

    assert len(client.get("/listings").json()) == 2
    assert len(client.get("/listings", params={"status": "found"}).json()) == 1
    assert len(client.get("/listings", params={"species": "cat"}).json()) == 1
    assert len(client.get("/listings", params={"city": "Казань"}).json()) == 1
    assert client.get("/listings", params={"status": "unknown"}).status_code == 422


def test_listing_validation(client, headers, listing_payload):
    future = {**listing_payload, "event_date": "2999-01-01"}
    assert client.post("/listings", json=future, headers=headers).status_code == 422
    bad_phone = {**listing_payload, "contact_phone": "xx"}
    assert client.post("/listings", json=bad_phone, headers=headers).status_code == 422
    missing_field = {k: v for k, v in listing_payload.items() if k != "city"}
    assert client.post("/listings", json=missing_field, headers=headers).status_code == 422


def test_listing_with_missing_pet_returns_404(client, headers, listing_payload):
    assert client.post("/listings", json={**listing_payload, "pet_id": 999}, headers=headers).status_code == 404


def test_listing_cannot_use_foreign_pet(client, headers, listing_payload, other_session):
    foreign_pet = client.post(
        f"/users/{other_session['user']['id']}/pets",
        json={"name": "Чужой", "species": "dog"},
        headers={"Authorization": f"Bearer {other_session['access_token']}"},
    ).json()
    response = client.post("/listings", json={**listing_payload, "pet_id": foreign_pet["id"]}, headers=headers)
    assert response.status_code == 400


# ---------- Связанные записи ----------


def test_deleting_pet_keeps_listing_and_clears_pet_id(client, user, headers, listing_payload):
    pet = client.post(f"/users/{user['id']}/pets", json={"name": "Рыжик", "species": "cat"}, headers=headers).json()
    listing = client.post("/listings", json={**listing_payload, "pet_id": pet["id"]}, headers=headers).json()
    assert listing["pet_id"] == pet["id"]

    client.delete(f"/pets/{pet['id']}", headers=headers)
    after = client.get(f"/listings/{listing['id']}")
    assert after.status_code == 200
    assert after.json()["pet_id"] is None


def test_deleting_user_cascades_to_pets_photos_listings_and_tokens(client, session, user, headers, listing_payload):
    pet = client.post(f"/users/{user['id']}/pets", json={"name": "Рыжик", "species": "cat"}, headers=headers).json()
    client.post(f"/pets/{pet['id']}/photos", files={"file": ("c.png", PNG, "image/png")}, headers=headers)
    listing = client.post("/listings", json=listing_payload, headers=headers).json()

    assert client.delete(f"/users/{user['id']}", headers=headers).status_code == 204
    assert client.get(f"/listings/{listing['id']}").status_code == 404
    assert client.get("/listings", params={"limit": 100}).json() == []
    # refresh token удалённого пользователя больше не работает
    assert client.post("/auth/refresh", json={"refresh_token": session["refresh_token"]}).status_code == 401
