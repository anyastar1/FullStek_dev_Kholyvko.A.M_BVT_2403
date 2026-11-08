"""Криптографические примитивы: хеш пароля, JWT access token, refresh token.

Слой не знает ни про БД, ни про HTTP.
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

from app.config import get_settings

# ---------- Пароли ----------

# Argon2id — современный алгоритм, предназначенный именно для хранения паролей:
# медленный, требует много памяти, соль генерируется автоматически и входит в строку хеша.
_hasher = PasswordHasher()

# Хеш-пустышка: при входе с несуществующим email проверяем пароль с ним,
# чтобы ответ занимал столько же времени и нельзя было угадать, какие email зарегистрированы.
_DUMMY_HASH = _hasher.hash("dummy-password-for-timing")


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    """True, если пароль подходит к хешу. Для None (пользователя нет) тратит то же время и возвращает False."""
    try:
        return _hasher.verify(password_hash or _DUMMY_HASH, password) and password_hash is not None
    except (VerificationError, InvalidHashError):
        return False


# ---------- Access token (JWT) ----------

ACCESS = "access"


class InvalidToken(Exception):
    """Токен повреждён, подделан, просрочен или не того типа."""


def create_access_token(user_id: int) -> tuple[str, int]:
    """Возвращает (jwt, срок жизни в секундах). В токене только id пользователя, тип и время."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    lifetime = timedelta(minutes=settings.access_token_minutes)
    payload = {"sub": str(user_id), "type": ACCESS, "iat": now, "exp": now + lifetime}
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)
    return token, int(lifetime.total_seconds())


def decode_access_token(token: str) -> int:
    """Проверяет подпись и срок действия, возвращает id пользователя."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],  # алгоритм задаём явно, из токена его не берём
            options={"require": ["exp", "sub", "type"]},
        )
        if payload["type"] != ACCESS:
            raise InvalidToken("Неверный тип токена")
        return int(payload["sub"])
    except (jwt.PyJWTError, ValueError) as exc:
        raise InvalidToken(str(exc)) from exc


# ---------- Refresh token ----------


def new_refresh_token() -> str:
    """Случайная непрозрачная строка (не JWT): её смысл известен только серверу."""
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    """В БД лежит только SHA-256: утечка таблицы не даёт готовых токенов."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
