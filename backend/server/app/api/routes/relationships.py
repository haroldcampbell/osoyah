from __future__ import annotations

from typing import Union

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.server.app.core.config import get_settings
from backend.server.app.db.models import (
    Board as BoardRecord,
    BoardRelationship as BoardRelationshipRecord,
    Card as CardRecord,
    CardRelationship as CardRelationshipRecord,
)
from backend.server.app.db.session import get_session
from backend.server.app.schemas import (
    BoardRelationshipCreateRequest,
    CardRelationshipCreateRequest,
    ErrorResponse,
)
from backend.server.app.services.relationships_service import (
    build_board_hierarchy_maps,
    build_card_parent_map,
    get_board_depth,
    get_board_subtree_height,
    load_card_relationships,
    utc_now,
    would_create_board_cycle,
    would_create_card_cycle,
)

router = APIRouter()


def error_response(code: str, message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "details": {}}},
    )


@router.post(
    "/cards/{card_id}/relationships",
    response_model=None,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def create_card_relationship(
    card_id: str,
    payload: CardRelationshipCreateRequest,
    session: Session = Depends(get_session),
) -> Union[dict, JSONResponse]:
    parent = session.get(CardRecord, card_id)
    if not parent:
        return error_response("not_found", "Parent card not found.", 404)
    child = session.get(CardRecord, payload.childCardId)
    if not child:
        return error_response("not_found", "Child card not found.", 404)
    if card_id == payload.childCardId:
        return error_response(
            "validation_error", "A card cannot be its own parent.", 400
        )

    relationships = load_card_relationships(session)
    parent_by_child = build_card_parent_map(relationships)
    if would_create_card_cycle(payload.childCardId, card_id, parent_by_child):
        return error_response(
            "validation_error", "This parent would create a cycle.", 400
        )

    existing_parent = session.execute(
        select(CardRelationshipRecord).where(
            CardRelationshipRecord.child_card_id == payload.childCardId
        )
    ).scalar_one_or_none()
    if existing_parent:
        if existing_parent.parent_card_id == card_id:
            return error_response(
                "validation_error", "This parent is already linked.", 400
            )
        session.delete(existing_parent)

    session.add(
        CardRelationshipRecord(
            parent_card_id=card_id,
            child_card_id=payload.childCardId,
            created_at=utc_now(),
        )
    )
    session.commit()
    return {"success": True}


@router.delete(
    "/cards/{card_id}/relationships/{child_card_id}",
    response_model=None,
    responses={404: {"model": ErrorResponse}},
)
def delete_card_relationship(
    card_id: str,
    child_card_id: str,
    session: Session = Depends(get_session),
) -> Union[dict, JSONResponse]:
    relationship = session.get(
        CardRelationshipRecord,
        {"parent_card_id": card_id, "child_card_id": child_card_id},
    )
    if not relationship:
        return error_response("not_found", "Card relationship not found.", 404)
    session.delete(relationship)
    session.commit()
    return {"success": True}


@router.post(
    "/boards/{board_id}/relationships",
    response_model=None,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def create_board_relationship(
    board_id: str,
    payload: BoardRelationshipCreateRequest,
    session: Session = Depends(get_session),
) -> Union[dict, JSONResponse]:
    parent = session.get(BoardRecord, board_id)
    if not parent:
        return error_response("not_found", "Parent board not found.", 404)
    child = session.get(BoardRecord, payload.childBoardId)
    if not child:
        return error_response("not_found", "Child board not found.", 404)
    if board_id == payload.childBoardId:
        return error_response(
            "validation_error", "A board cannot be its own parent.", 400
        )

    relationships = session.execute(select(BoardRelationshipRecord)).scalars().all()
    parent_by_child, children_by_parent = build_board_hierarchy_maps(relationships)
    if would_create_board_cycle(payload.childBoardId, board_id, parent_by_child):
        return error_response(
            "validation_error", "This parent would create a cycle.", 400
        )

    subtree_height = get_board_subtree_height(
        payload.childBoardId, children_by_parent, set()
    )
    parent_depth = get_board_depth(board_id, parent_by_child)
    resulting_depth = parent_depth + subtree_height
    max_depth = get_settings().relationship_max_depth
    if resulting_depth > max_depth:
        return error_response(
            "validation_error",
            f"This parent would exceed depth {max_depth}.",
            400,
        )

    existing_parent = session.execute(
        select(BoardRelationshipRecord).where(
            BoardRelationshipRecord.child_board_id == payload.childBoardId
        )
    ).scalar_one_or_none()
    if existing_parent:
        if existing_parent.parent_board_id == board_id:
            return error_response(
                "validation_error", "This parent is already linked.", 400
            )
        session.delete(existing_parent)

    session.add(
        BoardRelationshipRecord(
            parent_board_id=board_id,
            child_board_id=payload.childBoardId,
            created_at=utc_now(),
        )
    )
    session.commit()
    return {"success": True}


@router.delete(
    "/boards/{board_id}/relationships/{child_board_id}",
    response_model=None,
    responses={404: {"model": ErrorResponse}},
)
def delete_board_relationship(
    board_id: str,
    child_board_id: str,
    session: Session = Depends(get_session),
) -> Union[dict, JSONResponse]:
    relationship = session.get(
        BoardRelationshipRecord,
        {"parent_board_id": board_id, "child_board_id": child_board_id},
    )
    if not relationship:
        return error_response("not_found", "Board relationship not found.", 404)
    session.delete(relationship)
    session.commit()
    return {"success": True}
