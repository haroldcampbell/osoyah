from fastapi import APIRouter

from backend.server.app.api.routes import boards, relationships

api_router = APIRouter(prefix="/api")
api_router.include_router(boards.router)
api_router.include_router(relationships.router)
