import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app import auth, crud, models, schemas
from app.config import get_settings
from app.crud import AppError
from app.database import get_db

# Питомцы — часть личного профиля: все маршруты приватные и доступны только владельцу.
router = APIRouter(
    prefix="/pets",
    tags=["Питомцы"],
    responses={
        401: {"model": schemas.ErrorResponse, "description": "Нет или недействителен access token"},
        403: {"model": schemas.ErrorResponse, "description": "Чужой питомец"},
    },
)

_NOT_FOUND = {404: {"model": schemas.ErrorResponse, "description": "Питомец не найден"}}

_ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}


@router.get("/{pet_id}", response_model=schemas.PetRead, responses=_NOT_FOUND)
def get_pet(pet_id: int, current: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return auth.get_owned_pet(db, pet_id, current)


@router.patch("/{pet_id}", response_model=schemas.PetRead, responses=_NOT_FOUND)
def update_pet(
    pet_id: int,
    data: schemas.PetUpdate,
    current: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    auth.get_owned_pet(db, pet_id, current)
    return crud.update_pet(db, pet_id, data)


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT, responses=_NOT_FOUND)
def delete_pet(pet_id: int, current: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    auth.get_owned_pet(db, pet_id, current)
    crud.delete_pet(db, pet_id, get_settings().upload_dir)


@router.post(
    "/{pet_id}/photos",
    response_model=schemas.PetPhotoRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        **_NOT_FOUND,
        413: {"model": schemas.ErrorResponse, "description": "Файл слишком большой"},
        415: {"model": schemas.ErrorResponse, "description": "Неподдерживаемый тип файла"},
    },
)
async def upload_pet_photo(
    pet_id: int,
    file: UploadFile = File(...),
    current: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    settings = get_settings()
    auth.get_owned_pet(db, pet_id, current)  # питомец существует и принадлежит текущему пользователю

    extension = _ALLOWED_TYPES.get(file.content_type or "")
    if extension is None:
        raise AppError(415, "Допустимы только изображения JPEG, PNG или WebP")

    content = await file.read(settings.max_upload_bytes + 1)
    if len(content) > settings.max_upload_bytes:
        raise AppError(413, f"Файл больше {settings.max_upload_mb} МБ")
    if not content:
        raise AppError(400, "Файл пустой")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{extension}"
    (upload_dir / filename).write_bytes(content)

    try:
        return crud.add_pet_photo(db, pet_id, f"/uploads/{filename}")
    except Exception:
        (upload_dir / filename).unlink(missing_ok=True)
        raise


@router.delete(
    "/{pet_id}/photos/{photo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": schemas.ErrorResponse, "description": "Питомец или фото не найдены"}},
)
def delete_pet_photo(
    pet_id: int,
    photo_id: int,
    current: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    auth.get_owned_pet(db, pet_id, current)
    crud.delete_pet_photo(db, pet_id, photo_id, get_settings().upload_dir)
