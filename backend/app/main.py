from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app import models  # noqa: F401  (регистрирует модели в Base.metadata)
from app.api import auth, listings, pets, users
from app.config import get_settings
from app.crud import AppError
from app.database import Base, engine

settings = get_settings()
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Нашлись — API поиска потерянных животных",
    description=(
        "Backend: пользователи, питомцы с фото и объявления «потерян/найден». "
        "ЛР №4: регистрация и вход, JWT access token, refresh token с отзывом, разграничение прав."
    ),
    version="0.4.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=exc.headers)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(pets.router)
app.include_router(listings.router)

app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.get("/health", tags=["Служебное"])
def health() -> dict[str, str]:
    return {"status": "ok"}
