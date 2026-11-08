from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import auth, crud, models, schemas
from app.config import get_settings
from app.database import get_db

# Все маршруты приватные: пользователь работает только со своими данными.
# Регистрация находится в /auth/register, публичного списка пользователей нет (в нём были бы чужие email).
router = APIRouter(
    prefix="/users",
    tags=["Пользователи"],
    responses={
        401: {"model": schemas.ErrorResponse, "description": "Нет или недействителен access token"},
        403: {"model": schemas.ErrorResponse, "description": "Чужой профиль"},
    },
)


@router.get("/{user_id}", response_model=schemas.UserRead)
def get_user(user_id: int, current: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    auth.ensure_self(current, user_id)
    return crud.get_user(db, user_id)


@router.patch(
    "/{user_id}",
    response_model=schemas.UserRead,
    responses={409: {"model": schemas.ErrorResponse, "description": "Email уже занят"}},
)
def update_user(
    user_id: int,
    data: schemas.UserUpdate,
    current: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    auth.ensure_self(current, user_id)
    return crud.update_user(db, user_id, data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, current: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    auth.ensure_self(current, user_id)
    crud.delete_user(db, user_id, get_settings().upload_dir)


# --- Питомцы пользователя (вложенный ресурс) ---


@router.get("/{user_id}/pets", response_model=list[schemas.PetRead], tags=["Питомцы"])
def list_user_pets(
    user_id: int, current: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)
):
    auth.ensure_self(current, user_id)
    return crud.list_user_pets(db, user_id)


@router.post(
    "/{user_id}/pets",
    response_model=schemas.PetRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Питомцы"],
)
def create_pet(
    user_id: int,
    data: schemas.PetCreate,
    current: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    auth.ensure_self(current, user_id)
    return crud.create_pet(db, user_id, data)
