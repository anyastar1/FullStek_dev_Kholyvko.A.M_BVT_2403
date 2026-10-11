from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app import crud, schemas
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
        404: {"model": schemas.ErrorResponse, "description": "Автор или питомец не найден"},
    },
)
def create_listing(data: schemas.ListingCreate, db: Session = Depends(get_db)):
    return crud.create_listing(db, data)


@router.get("", response_model=list[schemas.ListingRead])
def list_listings(
    status: ListingStatus | None = None,
    species: Species | None = None,
    city: str | None = None,
    author_id: int | None = None,
    include_inactive: bool = False,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
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
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    return crud.get_listing(db, listing_id)


@router.patch("/{listing_id}", response_model=schemas.ListingRead, responses=_NOT_FOUND)
def update_listing(listing_id: int, data: schemas.ListingUpdate, db: Session = Depends(get_db)):
    return crud.update_listing(db, listing_id, data)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT, responses=_NOT_FOUND)
def delete_listing(listing_id: int, db: Session = Depends(get_db)):
    crud.delete_listing(db, listing_id)
