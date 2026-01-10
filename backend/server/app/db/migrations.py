from __future__ import annotations

from backend.server.app.core.config import Settings
from backend.server.app.db.models import Base
from backend.server.app.db.session import engine


def run_migrations(settings: Settings) -> None:
    try:
        from alembic import command
        from alembic.config import Config
    except ImportError:
        Base.metadata.create_all(bind=engine)
        return

    try:
        config_path = settings.backend_root / "alembic.ini"
        config = Config(str(config_path))
        config.set_main_option("sqlalchemy.url", settings.database_url)
        command.upgrade(config, "head")
    except Exception:
        Base.metadata.create_all(bind=engine)
