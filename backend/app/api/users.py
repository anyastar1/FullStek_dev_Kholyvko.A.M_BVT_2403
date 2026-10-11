from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.config import get_settings
from app.database import get_db

router = APIRouter(prefix="/users", tags=["Пользователи"])

_NOT_FOUND = {404: {"model": schemas.ErrorResponse, "description": "Пользователь не найден"}}


@router.post(
    "",
    response_model=schemas.UserRead,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": schemas.ErrorResponse, "description": "Email уже занят"}},
)
def create_user(data: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, data)


@router.get("", response_model=list[schemas.UserRead])
def list_users(skip: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100), db: Session = Depends(get_db)):
    return crud.list_users(db, skip, limit)


@router.get("/{user_id}", response_model=schemas.UserRead, responses=_NOT_FOUND)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user(db, user_id)


@router.patch("/{user_id}", response_model=schemas.UserRead, responses=_NOT_FOUND)
def update_user(user_id: int, data: schemas.UserUpdate, db: Session = Depends(get_db)):
    return crud.update_user(db, user_id, data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, responses=_NOT_FOUND)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    crud.delete_user(db, user_id, get_settings().upload_dir)


@router.get("/{user_id}/pets", response_model=list[schemas.PetRead], tags=["Питомцы"], responses=_NOT_FOUND)
def list_user_pets(user_id: int, db: Session = Depends(get_db)):
    return crud.list_user_pets(db, user_id)


@router.post(
    "/{user_id}/pets",
    response_model=schemas.PetRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Питомцы"],
    responses=_NOT_FOUND,
)
def create_pet(user_id: int, data: schemas.PetCreate, db: Session = Depends(get_db)):
    return crud.create_pet(db, user_id, data)
