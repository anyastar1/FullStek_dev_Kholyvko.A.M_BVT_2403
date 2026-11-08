import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app import crud, models, schemas, security
from app.config import get_settings
from app.crud import AppError
from app.database import get_db

_BEARER = {"WWW-Authenticate": "Bearer"}
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)


def _unauthorized(detail: str) -> AppError:
    return AppError(401, detail, _BEARER)


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


def _issue_tokens(db: Session, user: models.User, session_id: str | None = None) -> schemas.TokenPair:
    settings = get_settings()
    access, expires_in = security.create_access_token(user.id)
    refresh = security.new_refresh_token()
    db.add(
        models.RefreshToken(
            user_id=user.id,
            session_id=session_id or str(uuid.uuid4()),
            token_hash=security.hash_refresh_token(refresh),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_days),
        )
    )
    db.commit()
    return schemas.TokenPair(access_token=access, refresh_token=refresh, expires_in=expires_in)


def _auth_response(db: Session, user: models.User) -> schemas.AuthResponse:
    pair = _issue_tokens(db, user)
    return schemas.AuthResponse(**pair.model_dump(), user=schemas.UserRead.model_validate(user))


# ---------- Сценарии ----------


def register(db: Session, data: schemas.RegisterRequest) -> schemas.AuthResponse:
    user = crud.create_user(db, data, security.hash_password(data.password))
    return _auth_response(db, user)


def login(db: Session, email: str, password: str) -> schemas.AuthResponse:
    user = crud.get_user_by_email(db, email)
    # Проверка выполняется и для несуществующего email, ответ один и тот же в обоих случаях.
    if not security.verify_password(password, user.password_hash if user else None) or user is None:
        raise _unauthorized("Неверный email или пароль")
    return _auth_response(db, user)


def _revoke_session(db: Session, session_id: str) -> None:
    db.execute(
        update(models.RefreshToken)
        .where(models.RefreshToken.session_id == session_id, models.RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(timezone.utc))
    )
    db.commit()


def _find_refresh(db: Session, raw_token: str) -> models.RefreshToken | None:
    return db.scalar(
        select(models.RefreshToken).where(models.RefreshToken.token_hash == security.hash_refresh_token(raw_token))
    )


def refresh(db: Session, raw_token: str) -> schemas.TokenPair:
    """Меняет действующий refresh token на новую пару. Старый refresh token сразу перестаёт работать."""
    stored = _find_refresh(db, raw_token)
    if stored is None:
        raise _unauthorized("Недействительный refresh token")
    if stored.revoked_at is not None:
        _revoke_session(db, stored.session_id)
        raise _unauthorized("Refresh token отозван, войдите заново")
    if _aware(stored.expires_at) <= datetime.now(timezone.utc):
        raise _unauthorized("Срок действия refresh token истёк, войдите заново")

    user = db.get(models.User, stored.user_id)
    if user is None:
        raise _unauthorized("Недействительный refresh token")

    stored.revoked_at = datetime.now(timezone.utc) 
    db.flush()
    return _issue_tokens(db, user, stored.session_id)


def logout(db: Session, raw_token: str) -> None:
    """Завершает сессию: все её refresh token отзываются. Повторный вызов или неизвестный токен — не ошибка."""
    stored = _find_refresh(db, raw_token)
    if stored is not None:
        _revoke_session(db, stored.session_id)


def _user_from_token(db: Session, token: str) -> models.User:
    try:
        user_id = security.decode_access_token(token)
    except security.InvalidToken:
        raise _unauthorized("Недействительный или просроченный токен")
    user = db.get(models.User, user_id)
    if user is None:
        raise _unauthorized("Пользователь не найден")
    return user


def get_current_user(token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    if not token:
        raise _unauthorized("Требуется авторизация")
    return _user_from_token(db, token)


def get_optional_user(token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User | None:
    if not token:
        return None
    return _user_from_token(db, token)

def forbidden(detail: str = "Нет прав на это действие") -> AppError:
    return AppError(403, detail)


def ensure_self(current: models.User, user_id: int) -> None:
    if current.id != user_id:
        raise forbidden("Можно работать только со своим профилем")


def get_owned_pet(db: Session, pet_id: int, current: models.User) -> models.Pet:
    pet = crud.get_pet(db, pet_id)  # 404, если питомца нет
    if pet.owner_id != current.id:
        raise forbidden("Это не ваш питомец")
    return pet


def get_own_listing(db: Session, listing_id: int, current: models.User) -> models.Listing:
    listing = crud.get_listing(db, listing_id)
    if listing.author_id != current.id:
        raise forbidden("Это не ваше объявление")
    return listing
