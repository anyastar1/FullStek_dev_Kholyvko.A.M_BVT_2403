from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import auth, models, schemas
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["Авторизация"])

_UNAUTHORIZED = {401: {"model": schemas.ErrorResponse, "description": "Неверные учётные данные или токен"}}


@router.post(
    "/register",
    response_model=schemas.AuthResponse,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": schemas.ErrorResponse, "description": "Email уже занят"}},
)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    return auth.register(db, data)


@router.post("/login", response_model=schemas.AuthResponse, responses=_UNAUTHORIZED)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    return auth.login(db, data.email, data.password)


@router.post("/token", response_model=schemas.AuthResponse, responses=_UNAUTHORIZED, include_in_schema=True)
def login_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return auth.login(db, form.username, form.password)


@router.post("/refresh", response_model=schemas.TokenPair, responses=_UNAUTHORIZED)
def refresh(data: schemas.RefreshRequest, db: Session = Depends(get_db)):
    return auth.refresh(db, data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(data: schemas.RefreshRequest, db: Session = Depends(get_db)):
    auth.logout(db, data.refresh_token)


@router.get("/me", response_model=schemas.UserRead, responses=_UNAUTHORIZED)
def me(current: models.User = Depends(auth.get_current_user)):
    return current
