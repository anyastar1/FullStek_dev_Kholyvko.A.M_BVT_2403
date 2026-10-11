from pathlib import Path

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models, schemas


class AppError(Exception):
  

    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


def _not_found(what: str, obj_id: int) -> AppError:
    return AppError(404, f"{what} с id={obj_id} не найден(а)")



def get_user(db: Session, user_id: int) -> models.User:
    user = db.get(models.User, user_id)
    if user is None:
        raise _not_found("Пользователь", user_id)
    return user


def list_users(db: Session, skip: int = 0, limit: int = 50) -> list[models.User]:
    return list(db.scalars(select(models.User).order_by(models.User.id).offset(skip).limit(limit)))


def _email_taken(db: Session, email: str, exclude_id: int | None = None) -> bool:
    query = select(models.User.id).where(models.User.email == email.lower())
    if exclude_id is not None:
        query = query.where(models.User.id != exclude_id)
    return db.scalar(query) is not None


def create_user(db: Session, data: schemas.UserCreate) -> models.User:
    email = data.email.lower()
    if _email_taken(db, email):
        raise AppError(409, f"Пользователь с email {email} уже существует")
    user = models.User(**{**data.model_dump(), "email": email})
    db.add(user)
    try:
        db.commit()
    except IntegrityError: 
        db.rollback()
        raise AppError(409, f"Пользователь с email {email} уже существует")
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, data: schemas.UserUpdate) -> models.User:
    user = get_user(db, user_id)
    changes = data.model_dump(exclude_unset=True)
    if "email" in changes:
        if changes["email"] is None:
            raise AppError(422, "email нельзя обнулить")
        changes["email"] = changes["email"].lower()
        if _email_taken(db, changes["email"], exclude_id=user_id):
            raise AppError(409, f"Пользователь с email {changes['email']} уже существует")
    if "name" in changes and changes["name"] is None:
        raise AppError(422, "name нельзя обнулить")
    for field, value in changes.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int, upload_dir: str) -> None:
    user = get_user(db, user_id)
    files = [photo.url for pet in user.pets for photo in pet.photos]
    db.delete(user)  
    db.commit()
    for url in files:
        _remove_file(url, upload_dir)

def get_pet(db: Session, pet_id: int) -> models.Pet:
    pet = db.get(models.Pet, pet_id)
    if pet is None:
        raise _not_found("Питомец", pet_id)
    return pet


def list_user_pets(db: Session, user_id: int) -> list[models.Pet]:
    get_user(db, user_id)  
    return list(db.scalars(select(models.Pet).where(models.Pet.owner_id == user_id).order_by(models.Pet.id)))


def create_pet(db: Session, user_id: int, data: schemas.PetCreate) -> models.Pet:
    get_user(db, user_id)
    pet = models.Pet(owner_id=user_id, **data.model_dump())
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet


def update_pet(db: Session, pet_id: int, data: schemas.PetUpdate) -> models.Pet:
    pet = get_pet(db, pet_id)
    changes = data.model_dump(exclude_unset=True)
    for required in ("name", "species"):
        if required in changes and changes[required] is None:
            raise AppError(422, f"{required} нельзя обнулить")
    for field, value in changes.items():
        setattr(pet, field, value)
    db.commit()
    db.refresh(pet)
    return pet


def delete_pet(db: Session, pet_id: int, upload_dir: str) -> None:
    pet = get_pet(db, pet_id)
    files = [photo.url for photo in pet.photos]
    db.delete(pet) 
    db.commit()
    for url in files:
        _remove_file(url, upload_dir)


def add_pet_photo(db: Session, pet_id: int, url: str) -> models.PetPhoto:
    pet = get_pet(db, pet_id)
    photo = models.PetPhoto(pet_id=pet.id, url=url)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


def delete_pet_photo(db: Session, pet_id: int, photo_id: int, upload_dir: str) -> None:
    get_pet(db, pet_id)
    photo = db.get(models.PetPhoto, photo_id)
    if photo is None or photo.pet_id != pet_id:
        raise AppError(404, f"Фото с id={photo_id} у питомца id={pet_id} не найдено")
    url = photo.url
    db.delete(photo)
    db.commit()
    _remove_file(url, upload_dir)


def get_listing(db: Session, listing_id: int) -> models.Listing:
    listing = db.get(models.Listing, listing_id)
    if listing is None:
        raise _not_found("Объявление", listing_id)
    return listing


def list_listings(
    db: Session,
    *,
    status: models.ListingStatus | None = None,
    species: models.Species | None = None,
    city: str | None = None,
    author_id: int | None = None,
    only_active: bool = True,
    skip: int = 0,
    limit: int = 50,
) -> list[models.Listing]:
    query = select(models.Listing)
    if status is not None:
        query = query.where(models.Listing.status == status)
    if species is not None:
        query = query.where(models.Listing.species == species)
    if city:
        query = query.where(models.Listing.city == city)
    if author_id is not None:
        query = query.where(models.Listing.author_id == author_id)
    if only_active:
        query = query.where(models.Listing.is_active.is_(True))
    query = query.order_by(models.Listing.event_date.desc(), models.Listing.id.desc()).offset(skip).limit(limit)
    return list(db.scalars(query))


def _check_pet_belongs_to_author(db: Session, pet_id: int, author_id: int) -> None:
    pet = db.get(models.Pet, pet_id)
    if pet is None:
        raise AppError(404, f"Питомец с id={pet_id} не найден")
    if pet.owner_id != author_id:
        raise AppError(400, "Нельзя привязать к объявлению питомца другого пользователя")


def create_listing(db: Session, data: schemas.ListingCreate) -> models.Listing:
    get_user(db, data.author_id)
    if data.pet_id is not None:
        _check_pet_belongs_to_author(db, data.pet_id, data.author_id)
    listing = models.Listing(**data.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


def update_listing(db: Session, listing_id: int, data: schemas.ListingUpdate) -> models.Listing:
    listing = get_listing(db, listing_id)
    changes = data.model_dump(exclude_unset=True)
    for required in ("status", "species", "name", "city", "event_date", "description", "contact_name", "contact_phone", "is_active"):
        if required in changes and changes[required] is None:
            raise AppError(422, f"{required} нельзя обнулить")
    if changes.get("pet_id") is not None:
        _check_pet_belongs_to_author(db, changes["pet_id"], listing.author_id)
    for field, value in changes.items():
        setattr(listing, field, value)
    db.commit()
    db.refresh(listing)
    return listing


def delete_listing(db: Session, listing_id: int) -> None:
    listing = get_listing(db, listing_id)
    db.delete(listing)
    db.commit()

def _remove_file(url: str, upload_dir: str) -> None:
    name = Path(url).name
    path = Path(upload_dir) / name
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass
