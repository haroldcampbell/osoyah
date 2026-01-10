# Server

FastAPI backend.

## API docs

See `docs/api/README.md` for endpoint documentation and example payloads.

## Running the app

From the repo root:
```bash
python -m uvicorn backend.server.app.main:app --reload
```

Or use the helper script:
```bash
python backend/scripts/app.py
```

Why `python server/app/main.py` fails from `backend/`:
- The app uses package imports (`backend.server.app.*`), so it must be run as a module with the repo root on `PYTHONPATH` (or by using `-m uvicorn` as shown above).

## Module structure

- `backend/server/app/main.py` wires the FastAPI app and startup lifecycle.
- `backend/server/app/api/` contains route modules and the API router.
- `backend/server/app/services/` holds domain helpers used by routes.
- `backend/server/app/db/` owns SQLAlchemy models, sessions, migrations, and seed/init logic.
- `backend/server/app/schemas/` contains Pydantic request/response schemas.
- `backend/server/app/core/` centralizes configuration and settings.
