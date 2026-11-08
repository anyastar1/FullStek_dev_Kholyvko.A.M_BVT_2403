# Backend «Нашлись» — Лабораторная работа №2

Backend, API и работа с базой данных: FastAPI + PostgreSQL + SQLAlchemy.

## Стек

- **FastAPI** — HTTP API и автодокументация (Swagger UI)
- **SQLAlchemy 2.0** — ORM
- **PostgreSQL 16** — база данных (драйвер `psycopg` 3)
- **Pydantic 2** — схемы валидации запросов и ответов, настройки из окружения

## Структура кода

```
backend/
  app/
    main.py          # создание приложения, CORS, подключение роутеров, статика /uploads
    config.py        # конфигурация из переменных окружения (.env)
    database.py      # подключение к БД, сессии, get_db
    models.py        # модели SQLAlchemy (таблицы и связи)
    schemas.py       # схемы валидации Pydantic (запросы и ответы)
    crud.py          # операции с данными и бизнес-логика
    api/
      users.py       # маршруты пользователей (+ питомцы пользователя)
      pets.py        # маршруты питомцев и их фото
      listings.py    # маршруты объявлений
  tests/             # автотесты API (pytest, SQLite в памяти)
  uploads/           # загруженные фото (содержимое не коммитится)
  .env.example       # пример настроек без секретов
  docker-compose.yml # локальная PostgreSQL
  requirements.txt
```

Слои: **маршруты** (`api/`) принимают запрос и вызывают **операции с данными** (`crud.py`),
которые работают с **моделями** (`models.py`); входные и выходные данные описаны **схемами**
(`schemas.py`); подключение к БД — в `database.py`; параметры — в `config.py`.

## Модель данных

```
users 1 ───< pets 1 ───< pet_photos
  │            │
  │            └───────< listings   (pet_id, необязательно)
  └─────────────────────< listings   (author_id)
```

| Таблица | Поля | Связи |
|---|---|---|
| `users` | `id` PK, `email` (уникальный), `name`, `phone`, `city`, `created_at` | — |
| `pets` | `id` PK, `owner_id` FK→users, `name`, `species`, `breed`, `color`, `description`, `created_at` | принадлежит пользователю |
| `pet_photos` | `id` PK, `pet_id` FK→pets, `url`, `created_at` | принадлежит питомцу |
| `listings` | `id` PK, `author_id` FK→users, `pet_id` FK→pets (NULL), `status` (`lost`/`found`), `species`, `name`, `breed`, `color`, `city`, `district`, `event_date`, `description`, `photo_url`, `contact_name`, `contact_phone`, `is_active`, `created_at` | автор — пользователь; питомец необязателен |

Поведение связанных записей при удалении:

- удаление **пользователя** удаляет его питомцев, их фото и его объявления (`CASCADE`);
- удаление **питомца** удаляет его фото, а его объявления **остаются**, у них `pet_id` становится `NULL` (`SET NULL`);
- файлы фотографий удаляются с диска вместе с записями.

Бизнес-правила: email уникален (регистр не важен); к объявлению можно привязать только
питомца его автора; дата события не может быть в будущем.

## API

Интерактивная документация: <http://localhost:8000/docs>

| Метод | Путь | Описание |
|---|---|---|
| POST / GET | `/users` | создать пользователя / список (`skip`, `limit`) |
| GET / PATCH / DELETE | `/users/{id}` | получить / изменить / удалить |
| POST / GET | `/users/{id}/pets` | добавить питомца / питомцы пользователя |
| GET / PATCH / DELETE | `/pets/{id}` | получить / изменить / удалить питомца |
| POST | `/pets/{id}/photos` | загрузить фото (multipart, поле `file`; JPEG/PNG/WebP, до 5 МБ) |
| DELETE | `/pets/{id}/photos/{photo_id}` | удалить фото |
| POST / GET | `/listings` | создать объявление / список с фильтрами `status`, `species`, `city`, `author_id`, `include_inactive`, `skip`, `limit` |
| GET / PATCH / DELETE | `/listings/{id}` | получить / изменить / удалить |
| GET | `/health` | проверка работоспособности |

Фото отдаются как статика по адресу `/uploads/<имя файла>`.

### Коды ответов

| Код | Когда |
|---|---|
| 200 / 201 / 204 | успех / создано / удалено |
| 400 | пустой файл; привязка к объявлению чужого питомца |
| 404 | пользователь, питомец, фото или объявление не найдены |
| 409 | email уже занят |
| 413 | файл больше лимита |
| 415 | тип файла не JPEG/PNG/WebP |
| 422 | некорректные данные: неверный email, телефон, enum, дата в будущем, нет обязательного поля |

Ошибки возвращаются в виде `{"detail": "понятное сообщение"}` (для 422 — список ошибок по полям).

## Настройка и запуск

Требуется Python 3.11+ и PostgreSQL 14+ (или Docker).

**1. Окружение и зависимости**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**2. База данных**

Вариант А — Docker (пароль задайте сами, он нужен и в `.env`):

```bash
export POSTGRES_PASSWORD=придумайте_пароль      # Windows PowerShell: $env:POSTGRES_PASSWORD="..."
docker compose up -d
```

Вариант Б — свой PostgreSQL:

```sql
CREATE USER nashlis_user WITH PASSWORD 'придумайте_пароль';
CREATE DATABASE nashlis OWNER nashlis_user;
```

**3. Настройки**

```bash
cp .env.example .env      # Windows: copy .env.example .env
```

Откройте `.env` и впишите в `DATABASE_URL` тот же пароль. Файл `.env` в Git не попадает.

**4. Создание таблиц и запуск**

Таблицы создаются автоматически при старте приложения (`Base.metadata.create_all`):

```bash
uvicorn app.main:app --reload
```

API: <http://localhost:8000>, документация: <http://localhost:8000/docs>.
Проверить таблицы: `psql -U nashlis_user -d nashlis -c "\dt"` — должны быть
`users`, `pets`, `pet_photos`, `listings`.

**5. Подключение frontend**

Frontend (Vite, `http://localhost:5173`) уже разрешён в CORS. Другой адрес укажите в `CORS_ORIGINS`.
Подключение страниц к API — в ЛР №5.

## Тесты

```bash
cd backend
pytest -v
```

Тесты используют SQLite в памяти и не затрагивают вашу PostgreSQL. Они проверяют
создание, чтение, изменение и удаление всех сущностей, фильтры, ошибки 404/409/415/422,
каскадное удаление и обнуление `pet_id` у объявлений.

## Ограничения этапа

- Нет авторизации: автор объявления передаётся в запросе (`author_id`). Регистрация, вход и токены — ЛР №4.
- Нет ИИ-поиска по фото — ЛР №5.
- Таблицы создаются через `create_all`, без миграций: при изменении моделей пересоздайте БД.
