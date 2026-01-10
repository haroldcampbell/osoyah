from __future__ import annotations

from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.server.app.core.config import get_settings

settings = get_settings()
settings.assets_dir.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    settings.database_url,
    future=True,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(
    bind=engine, class_=Session, autoflush=False, autocommit=False
)


def get_session() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session
