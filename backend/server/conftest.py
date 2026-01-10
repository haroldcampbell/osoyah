import os

import pytest
from sqlalchemy import delete

os.environ["OSOYAH_ENV"] = "test"

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


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture(autouse=True)
def initialize_database() -> None:
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
