import enum
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Species(str, enum.Enum):
    dog = "dog"
    cat = "cat"
    other = "other"


class ListingStatus(str, enum.Enum):
    lost = "lost"
    found = "found"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(32))
    city: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    pets: Mapped[list["Pet"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
    listings: Mapped[list["Listing"]] = relationship(back_populates="author", cascade="all, delete-orphan")


class Pet(Base):
    """Питомец из профиля пользователя (у питомца может быть несколько фото)."""

    __tablename__ = "pets"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    species: Mapped[Species] = mapped_column(Enum(Species, native_enum=False, length=16))
    breed: Mapped[str | None] = mapped_column(String(100))
    color: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    owner: Mapped[User] = relationship(back_populates="pets")
    photos: Mapped[list["PetPhoto"]] = relationship(
        back_populates="pet", cascade="all, delete-orphan", order_by="PetPhoto.id"
    )
    listings: Mapped[list["Listing"]] = relationship(back_populates="pet")


class PetPhoto(Base):
    __tablename__ = "pet_photos"

    id: Mapped[int] = mapped_column(primary_key=True)
    pet_id: Mapped[int] = mapped_column(ForeignKey("pets.id", ondelete="CASCADE"), index=True)
    url: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    pet: Mapped[Pet] = relationship(back_populates="photos")


class Listing(Base):
    """Объявление «потерян» / «найден»."""

    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    pet_id: Mapped[int | None] = mapped_column(ForeignKey("pets.id", ondelete="SET NULL"), index=True)

    status: Mapped[ListingStatus] = mapped_column(Enum(ListingStatus, native_enum=False, length=16), index=True)
    species: Mapped[Species] = mapped_column(Enum(Species, native_enum=False, length=16), index=True)
    name: Mapped[str] = mapped_column(String(100))
    breed: Mapped[str | None] = mapped_column(String(100))
    color: Mapped[str | None] = mapped_column(String(100))
    city: Mapped[str] = mapped_column(String(100), index=True)
    district: Mapped[str | None] = mapped_column(String(100))
    event_date: Mapped[date] = mapped_column(Date)
    description: Mapped[str] = mapped_column(Text)
    photo_url: Mapped[str | None] = mapped_column(String(500))
    contact_name: Mapped[str] = mapped_column(String(100))
    contact_phone: Mapped[str] = mapped_column(String(32))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    author: Mapped[User] = relationship(back_populates="listings")
    pet: Mapped[Pet | None] = relationship(back_populates="listings")
