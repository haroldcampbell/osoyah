from __future__ import annotations

from contextlib import asynccontextmanager
import logging
import sys
import time
from pathlib import Path
from typing import AsyncIterator

from fastapi import FastAPI
from starlette.requests import Request

from backend.server.app.api.router import api_router
from backend.server.app.db import init_database


REPO_ROOT = Path(__file__).resolve().parents[3]
REQUEST_LOG_PATH = REPO_ROOT / "backend" / "server" / "logs" / "server.log"
REQUEST_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)


def configure_request_logger() -> logging.Logger:
    logger = logging.getLogger("osoyah.request")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()
    logger.propagate = False
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(logging.INFO)
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)
    return logger


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    init_database()
    yield


request_logger = configure_request_logger()

app = FastAPI(title="Osoyah API", version="0.1.0", lifespan=lifespan)


@app.middleware("http")
async def log_requests(request: Request, call_next):  # type: ignore[no-untyped-def]
    start = time.perf_counter()
    status_code = 500
    try:
        response = await call_next(request)
        status_code = response.status_code
        return response
    finally:
        duration_ms = (time.perf_counter() - start) * 1000
        message = f"{request.method} {request.url.path} -> {status_code} ({duration_ms:.1f}ms)"
        request_logger.info(message)
        print(message, flush=True)
        try:
            with REQUEST_LOG_PATH.open("a", encoding="utf-8") as log_file:
                log_file.write(f"{message}\n")
        except OSError:
            pass

app.include_router(api_router)
