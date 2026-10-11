PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 32


def test_user_crud(client):
    created = client.post("/users", json={"email": "Bob@Example.com", "name": " Боб "})
    assert created.status_code == 201
    body = created.json()
    assert body["email"] == "bob@example.com" 
    assert body["name"] == "Боб"

    assert client.get(f"/users/{body['id']}").json()["name"] == "Боб"

    updated = client.patch(f"/users/{body['id']}", json={"city": "Казань"})
    assert updated.status_code == 200 and updated.json()["city"] == "Казань"

    assert len(client.get("/users").json()) == 1
    assert client.delete(f"/users/{body['id']}").status_code == 204
    assert client.get(f"/users/{body['id']}").status_code == 404


def test_duplicate_email_returns_409(client, user):
    response = client.post("/users", json={"email": "ANNA@example.com", "name": "Другая"})
    assert response.status_code == 409


def test_update_email_to_taken_returns_409(client, user):
    other = client.post("/users", json={"email": "b@example.com", "name": "B"}).json()
    response = client.patch(f"/users/{other['id']}", json={"email": "anna@example.com"})
    assert response.status_code == 409


def test_invalid_user_data_returns_422(client):
    assert client.post("/users", json={"email": "not-an-email", "name": "X"}).status_code == 422
    assert client.post("/users", json={"email": "a@b.ru", "name": "   "}).status_code == 422
    assert client.post("/users", json={"email": "a@b.ru", "name": "X", "phone": "abc"}).status_code == 422


def test_missing_user_returns_404(client):
    assert client.get("/users/999").status_code == 404
    assert client.patch("/users/999", json={"name": "X"}).status_code == 404
    assert client.delete("/users/999").status_code == 404
    assert client.get("/users/999/pets").status_code == 404


def test_non_integer_id_returns_422(client):
    assert client.get("/users/abc").status_code == 422


def test_pet_crud_and_ownership(client, user):
    created = client.post(f"/users/{user['id']}/pets", json={"name": "Барсик", "species": "cat"})
    assert created.status_code == 201
    pet = created.json()
    assert pet["owner_id"] == user["id"] and pet["photos"] == []

    assert client.get(f"/users/{user['id']}/pets").json()[0]["id"] == pet["id"]
    assert client.patch(f"/pets/{pet['id']}", json={"color": "серый"}).json()["color"] == "серый"
    assert client.delete(f"/pets/{pet['id']}").status_code == 204
    assert client.get(f"/pets/{pet['id']}").status_code == 404


def test_invalid_species_returns_422(client, user):
    response = client.post(f"/users/{user['id']}/pets", json={"name": "Х", "species": "dragon"})
    assert response.status_code == 422


def test_pet_for_missing_user_returns_404(client):
    assert client.post("/users/999/pets", json={"name": "Х", "species": "dog"}).status_code == 404


def test_photo_upload_and_delete(client, user):
    pet = client.post(f"/users/{user['id']}/pets", json={"name": "Барсик", "species": "cat"}).json()

    uploaded = client.post(f"/pets/{pet['id']}/photos", files={"file": ("cat.png", PNG, "image/png")})
    assert uploaded.status_code == 201
    photo = uploaded.json()
    assert photo["url"].startswith("/uploads/")
    assert client.get(photo["url"]).status_code == 200
    assert len(client.get(f"/pets/{pet['id']}").json()["photos"]) == 1

    assert client.delete(f"/pets/{pet['id']}/photos/{photo['id']}").status_code == 204
    assert client.get(f"/pets/{pet['id']}").json()["photos"] == []
    assert client.delete(f"/pets/{pet['id']}/photos/{photo['id']}").status_code == 404


def test_photo_upload_rejects_wrong_type_and_missing_pet(client, user):
    pet = client.post(f"/users/{user['id']}/pets", json={"name": "Барсик", "species": "cat"}).json()
    bad = client.post(f"/pets/{pet['id']}/photos", files={"file": ("a.txt", b"hello", "text/plain")})
    assert bad.status_code == 415
    missing = client.post("/pets/999/photos", files={"file": ("cat.png", PNG, "image/png")})
    assert missing.status_code == 404



def test_listing_crud(client, listing_payload):
    created = client.post("/listings", json=listing_payload)
    assert created.status_code == 201
    listing = created.json()
    assert listing["is_active"] is True

    assert client.get(f"/listings/{listing['id']}").json()["name"] == "Рыжик"
    patched = client.patch(f"/listings/{listing['id']}", json={"description": "Нашёлся!", "is_active": False})
    assert patched.status_code == 200 and patched.json()["is_active"] is False
    assert client.get("/listings").json() == []
    assert len(client.get("/listings", params={"include_inactive": True}).json()) == 1

    assert client.delete(f"/listings/{listing['id']}").status_code == 204
    assert client.get(f"/listings/{listing['id']}").status_code == 404


def test_listing_filters(client, user, listing_payload):
    client.post("/listings", json=listing_payload)
    client.post("/listings", json={**listing_payload, "status": "found", "species": "dog", "city": "Казань"})

    assert len(client.get("/listings").json()) == 2
    assert len(client.get("/listings", params={"status": "found"}).json()) == 1
    assert len(client.get("/listings", params={"species": "cat"}).json()) == 1
    assert len(client.get("/listings", params={"city": "Казань"}).json()) == 1
    assert client.get("/listings", params={"status": "unknown"}).status_code == 422


def test_listing_validation(client, listing_payload):
    future = {**listing_payload, "event_date": "2999-01-01"}
    assert client.post("/listings", json=future).status_code == 422
    bad_phone = {**listing_payload, "contact_phone": "xx"}
    assert client.post("/listings", json=bad_phone).status_code == 422
    missing_field = {k: v for k, v in listing_payload.items() if k != "city"}
    assert client.post("/listings", json=missing_field).status_code == 422


def test_listing_with_missing_author_or_pet_returns_404(client, listing_payload):
    assert client.post("/listings", json={**listing_payload, "author_id": 999}).status_code == 404
    assert client.post("/listings", json={**listing_payload, "pet_id": 999}).status_code == 404


def test_listing_cannot_use_foreign_pet(client, user, listing_payload):
    other = client.post("/users", json={"email": "b@example.com", "name": "B"}).json()
    foreign_pet = client.post(f"/users/{other['id']}/pets", json={"name": "Чужой", "species": "dog"}).json()
    response = client.post("/listings", json={**listing_payload, "pet_id": foreign_pet["id"]})
    assert response.status_code == 400



def test_deleting_pet_keeps_listing_and_clears_pet_id(client, user, listing_payload):
    pet = client.post(f"/users/{user['id']}/pets", json={"name": "Рыжик", "species": "cat"}).json()
    listing = client.post("/listings", json={**listing_payload, "pet_id": pet["id"]}).json()
    assert listing["pet_id"] == pet["id"]

    client.delete(f"/pets/{pet['id']}")
    after = client.get(f"/listings/{listing['id']}")
    assert after.status_code == 200
    assert after.json()["pet_id"] is None


def test_deleting_user_cascades_to_pets_photos_and_listings(client, user, listing_payload):
    pet = client.post(f"/users/{user['id']}/pets", json={"name": "Рыжик", "species": "cat"}).json()
    client.post(f"/pets/{pet['id']}/photos", files={"file": ("c.png", PNG, "image/png")})
    listing = client.post("/listings", json=listing_payload).json()

    assert client.delete(f"/users/{user['id']}").status_code == 204
    assert client.get(f"/pets/{pet['id']}").status_code == 404
    assert client.get(f"/listings/{listing['id']}").status_code == 404
    assert client.get("/listings", params={"include_inactive": True}).json() == []
