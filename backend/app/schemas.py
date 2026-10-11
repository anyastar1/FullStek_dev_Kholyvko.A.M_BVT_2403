import re
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models import ListingStatus, Species

_PHONE_RE = re.compile(r"^\+?[0-9()\-\s]{6,20}$")


def _check_phone(value: str | None) -> str | None:
    if value is None:
        return value
    value = value.strip()
    if not _PHONE_RE.match(value):
        raise ValueError("Некорректный телефон: допускаются цифры, пробелы, +, - и скобки (6–20 символов)")
    return value


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=100)
    phone: str | None = None
    city: str | None = Field(default=None, max_length=100)

    _phone = field_validator("phone")(_check_phone)

    @field_validator("name")
    @classmethod
    def _strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Имя не может быть пустым")
        return value


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = None
    city: str | None = Field(default=None, max_length=100)

    _phone = field_validator("phone")(_check_phone)


class UserRead(ORMModel):
    id: int
    email: EmailStr
    name: str
    phone: str | None
    city: str | None
    created_at: datetime


class PetPhotoRead(ORMModel):
    id: int
    url: str
    created_at: datetime


class PetCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    species: Species
    breed: str | None = Field(default=None, max_length=100)
    color: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, max_length=2000)


class PetUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    species: Species | None = None
    breed: str | None = Field(default=None, max_length=100)
    color: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, max_length=2000)


class PetRead(ORMModel):
    id: int
    owner_id: int
    name: str
    species: Species
    breed: str | None
    color: str | None
    description: str | None
    created_at: datetime
    photos: list[PetPhotoRead] = []


class ListingBase(BaseModel):
    status: ListingStatus
    species: Species
    name: str = Field(min_length=1, max_length=100)
    breed: str | None = Field(default=None, max_length=100)
    color: str | None = Field(default=None, max_length=100)
    city: str = Field(min_length=1, max_length=100)
    district: str | None = Field(default=None, max_length=100)
    event_date: date
    description: str = Field(min_length=1, max_length=2000)
    photo_url: str | None = Field(default=None, max_length=500)
    contact_name: str = Field(min_length=1, max_length=100)
    contact_phone: str

    _phone = field_validator("contact_phone")(_check_phone)

    @field_validator("event_date")
    @classmethod
    def _not_future(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("Дата не может быть в будущем")
        return value


class ListingCreate(ListingBase):
    # Пока нет авторизации (ЛР №4), автор передаётся явно.
    author_id: int
    pet_id: int | None = None


class ListingUpdate(BaseModel):
    status: ListingStatus | None = None
    species: Species | None = None
    name: str | None = Field(default=None, min_length=1, max_length=100)
    breed: str | None = Field(default=None, max_length=100)
    color: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, min_length=1, max_length=100)
    district: str | None = Field(default=None, max_length=100)
    event_date: date | None = None
    description: str | None = Field(default=None, min_length=1, max_length=2000)
    photo_url: str | None = Field(default=None, max_length=500)
    contact_name: str | None = Field(default=None, min_length=1, max_length=100)
    contact_phone: str | None = None
    pet_id: int | None = None
    is_active: bool | None = None

    _phone = field_validator("contact_phone")(_check_phone)

    @field_validator("event_date")
    @classmethod
    def _not_future(cls, value: date | None) -> date | None:
        if value is not None and value > date.today():
            raise ValueError("Дата не может быть в будущем")
        return value


class ListingRead(ORMModel):
    id: int
    author_id: int
    pet_id: int | None
    status: ListingStatus
    species: Species
    name: str
    breed: str | None
    color: str | None
    city: str
    district: str | None
    event_date: date
    description: str
    photo_url: str | None
    contact_name: str
    contact_phone: str
    is_active: bool
    created_at: datetime


class ErrorResponse(BaseModel):
    detail: str
