from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from backend.server.app.api.router import api_router
from backend.server.app.db import init_database


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    init_database()
    yield


app = FastAPI(title="Osoyah API", version="0.1.0", lifespan=lifespan)
app.include_router(api_router)
