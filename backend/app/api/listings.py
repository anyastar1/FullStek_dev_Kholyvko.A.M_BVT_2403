from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app import auth, crud, models, schemas
from app.database import get_db
from app.models import ListingStatus, Species

router = APIRouter(prefix="/listings", tags=["Объявления"])

_NOT_FOUND = {404: {"model": schemas.ErrorResponse, "description": "Объявление не найдено"}}


@router.post(
    "",
    response_model=schemas.ListingRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": schemas.ErrorResponse, "description": "Питомец принадлежит другому пользователю"},
        401: {"model": schemas.ErrorResponse, "description": "Нужна авторизация"},
        404: {"model": schemas.ErrorResponse, "description": "Питомец не найден"},
    },
)
def create_listing(
    data: schemas.ListingCreate,
    current: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Приватный маршрут: автором объявления становится вошедший пользователь."""
    return crud.create_listing(db, current.id, data)


@router.get(
    "",
    response_model=list[schemas.ListingRead],
    responses={403: {"model": schemas.ErrorResponse, "description": "include_inactive — только для своих объявлений"}},
)
def list_listings(
    status: ListingStatus | None = None,
    species: Species | None = None,
    city: str | None = None,
    author_id: int | None = None,
    include_inactive: bool = False,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current: models.User | None = Depends(auth.get_optional_user),
    db: Session = Depends(get_db),
):
    """Публичный маршрут. Снятые с публикации объявления видит только их автор."""
    if include_inactive and (current is None or author_id != current.id):
        raise auth.forbidden("include_inactive доступен только вместе с author_id=<ваш id>")
    return crud.list_listings(
        db,
        status=status,
        species=species,
        city=city,
        author_id=author_id,
        only_active=not include_inactive,
        skip=skip,
        limit=limit,
    )


@router.get("/{listing_id}", response_model=schemas.ListingRead, responses=_NOT_FOUND)
def get_listing(
    listing_id: int,
    current: models.User | None = Depends(auth.get_optional_user),
    db: Session = Depends(get_db),
):
    """Публичный маршрут. Неактивное объявление для остальных выглядит как несуществующее."""
    listing = crud.get_listing(db, listing_id)
    if not listing.is_active and (current is None or current.id != listing.author_id):
        raise crud.AppError(404, f"Объявление с id={listing_id} не найдено")
    return listing


_PRIVATE = {
    **_NOT_FOUND,
    401: {"model": schemas.ErrorResponse, "description": "Нужна авторизация"},
    403: {"model": schemas.ErrorResponse, "description": "Чужое объявление"},
}


@router.patch("/{listing_id}", response_model=schemas.ListingRead, responses=_PRIVATE)
def update_listing(
    listing_id: int,
    data: schemas.ListingUpdate,
    current: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    auth.get_own_listing(db, listing_id, current)
    return crud.update_listing(db, listing_id, data)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT, responses=_PRIVATE)
def delete_listing(
    listing_id: int,
    current: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    auth.get_own_listing(db, listing_id, current)
    crud.delete_listing(db, listing_id)
