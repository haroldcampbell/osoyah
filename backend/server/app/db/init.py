from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from backend.server.app.core.config import Settings, get_settings
from backend.server.app.db.migrations import run_migrations
from backend.server.app.db.models import Board
from backend.server.app.db.seed import seed_database
from backend.server.app.db.session import SessionLocal, engine


def init_database(settings: Settings | None = None) -> None:
    settings = settings or get_settings()
    settings.assets_dir.mkdir(parents=True, exist_ok=True)
    run_migrations(settings)
    with SessionLocal() as session:
        has_board = session.execute(select(Board.id).limit(1)).scalar_one_or_none()
        if has_board:
            return
        try:
            seed_database(session, settings)
            session.commit()
        except IntegrityError:
            session.rollback()
            if settings.db_path.exists():
                engine.dispose()
                settings.db_path.unlink()
            run_migrations(settings)
            with SessionLocal() as retry_session:
                seed_database(retry_session, settings)
                retry_session.commit()
