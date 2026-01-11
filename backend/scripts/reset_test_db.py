#!/usr/bin/env python3
from __future__ import annotations

import os

from sqlalchemy import delete

from backend.server.app.core.config import get_settings
from backend.server.app.db import init_database
from backend.server.app.db.models import (
    Board,
    BoardList,
    BoardRelationship,
    Card,
    CardComment,
    CardRelationship,
    ListCard,
)
from backend.server.app.db.seed import seed_database
from backend.server.app.db.session import SessionLocal


def main() -> int:
    os.environ["OSOYAH_ENV"] = "test"
    get_settings.cache_clear()
    settings = get_settings()
    if not settings.db_path.exists():
        init_database()
    with SessionLocal() as session:
        session.execute(delete(ListCard))
        session.execute(delete(CardRelationship))
        session.execute(delete(BoardRelationship))
        session.execute(delete(CardComment))
        session.execute(delete(BoardList))
        session.execute(delete(Card))
        session.execute(delete(Board))
        session.commit()
        seed_database(session, settings)
        session.commit()
    print(f"Reset test database at {settings.db_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
