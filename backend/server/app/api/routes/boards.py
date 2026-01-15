from __future__ import annotations

from datetime import datetime
from typing import Union
from uuid import uuid4

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import delete, or_, select
from sqlalchemy.orm import Session

from backend.server.app.db.session import get_session
from backend.server.app.db.models import (
    Board as BoardRecord,
    BoardList,
    BoardRelationship as BoardRelationshipRecord,
    Card as CardRecord,
    CardComment as CardCommentRecord,
    CardRelationship as CardRelationshipRecord,
    ListCard,
)
from backend.server.app.schemas import (
    Board,
    BoardCreateRequest,
    BoardSnapshotResponse,
    BoardSummariesResponse,
    BoardSummary,
    BoardUpdateRequest,
    Card,
    CardCreateRequest,
    CardOrderRequest,
    CardRelationship,
    CardUpdateRequest,
    ErrorResponse,
    ListCardAttachRequest,
    ListCreateRequest,
    ListOrderRequest,
    ListUpdateRequest,
    BoardRelationship,
)
from backend.server.app.services.boards_service import (
    board_to_model,
    card_to_model,
    delete_orphan_cards,
    format_required_datetime,
    generate_id,
    utc_now,
    validate_board_description,
    validate_board_title,
    validate_card_title,
)

router = APIRouter()


def error_response(code: str, message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "details": {}}},
    )


@router.get(
    "/boards",
    response_model=BoardSummariesResponse,
    response_model_exclude_none=True,
)
def list_boards(session: Session = Depends(get_session)) -> BoardSummariesResponse:
    boards = session.execute(
        select(BoardRecord).order_by(BoardRecord.created_at)
    ).scalars()
    summaries = [
        BoardSummary(
            id=board.id,
            guid=board.guid,
            title=board.title,
            createdAt=format_required_datetime(board.created_at),
            description=board.description,
            pinned=board.pinned,
            archived=board.archived,
            rollupsEnabled=board.rollups_enabled,
        )
        for board in boards
    ]
    return BoardSummariesResponse(boards=summaries)


@router.get(
    "/boards/{board_id}",
    response_model=Board,
    response_model_exclude_none=True,
    responses={404: {"model": ErrorResponse}},
)
def get_board(
    board_id: str, session: Session = Depends(get_session)
) -> Union[Board, JSONResponse]:
    board = session.get(BoardRecord, board_id)
    if not board:
        return error_response("not_found", "Board not found.", 404)
    return board_to_model(board)


@router.get(
    "/boards/{board_id}/snapshot",
    response_model=BoardSnapshotResponse,
    response_model_exclude_none=True,
    responses={404: {"model": ErrorResponse}},
)
def get_board_snapshot(
    board_id: str, session: Session = Depends(get_session)
) -> Union[BoardSnapshotResponse, JSONResponse]:
    board = session.get(BoardRecord, board_id)
    if not board:
        return error_response("not_found", "Board not found.", 404)
    cards = session.execute(
        select(CardRecord).order_by(CardRecord.created_at)
    ).scalars()
    card_relationships = session.execute(select(CardRelationshipRecord)).scalars().all()
    board_relationships = (
        session.execute(select(BoardRelationshipRecord)).scalars().all()
    )

    return BoardSnapshotResponse(
        board=board_to_model(board),
        cards=[card_to_model(card) for card in cards],
        cardRelationships=[
            CardRelationship(
                parentCardId=item.parent_card_id,
                childCardId=item.child_card_id,
                createdAt=format_required_datetime(item.created_at),
            )
            for item in card_relationships
        ],
        boardRelationships=[
            BoardRelationship(
                parentBoardId=item.parent_board_id,
                childBoardId=item.child_board_id,
                createdAt=format_required_datetime(item.created_at),
            )
            for item in board_relationships
        ],
    )


@router.post(
    "/boards",
    response_model=Board,
    response_model_exclude_none=True,
)
def create_board(
    payload: BoardCreateRequest, session: Session = Depends(get_session)
) -> Union[Board, JSONResponse]:
    title_error = validate_board_title(payload.title)
    if title_error:
        return error_response("validation_error", title_error, 400)
    description_error = validate_board_description(payload.description)
    if description_error:
        return error_response("validation_error", description_error, 400)
    now = utc_now()
    board = BoardRecord(
        id=generate_id("board"),
        guid=str(uuid4()),
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        created_at=now,
        pinned=False,
        archived=False,
        rollups_enabled=False,
    )
    session.add(board)
    session.commit()
    session.refresh(board)
    return board_to_model(board)


@router.patch(
    "/boards/{board_id}",
    response_model=Board,
    response_model_exclude_none=True,
    responses={404: {"model": ErrorResponse}},
)
def update_board(
    board_id: str, payload: BoardUpdateRequest, session: Session = Depends(get_session)
) -> Union[Board, JSONResponse]:
    board = session.get(BoardRecord, board_id)
    if not board:
        return error_response("not_found", "Board not found.", 404)
    title_error = validate_board_title(payload.title)
    if title_error:
        return error_response("validation_error", title_error, 400)
    description_error = validate_board_description(payload.description)
    if description_error:
        return error_response("validation_error", description_error, 400)

    board.title = payload.title.strip()
    board.description = payload.description.strip() if payload.description else None
    if payload.rollupsEnabled is not None:
        board.rollups_enabled = payload.rollupsEnabled
    if payload.pinned is not None:
        board.pinned = payload.pinned
    if payload.archived is not None:
        board.archived = payload.archived
    session.commit()
    session.refresh(board)
    return board_to_model(board)


@router.delete(
    "/boards/{board_id}",
    response_model=None,
    responses={404: {"model": ErrorResponse}},
)
def delete_board(
    board_id: str, session: Session = Depends(get_session)
) -> Union[dict, JSONResponse]:
    board = session.get(BoardRecord, board_id)
    if not board:
        return error_response("not_found", "Board not found.", 404)
    session.execute(
        delete(BoardRelationshipRecord).where(
            or_(
                BoardRelationshipRecord.parent_board_id == board_id,
                BoardRelationshipRecord.child_board_id == board_id,
            )
        )
    )
    session.delete(board)
    session.commit()
    delete_orphan_cards(session)
    session.commit()
    return {"success": True}


@router.patch(
    "/boards/{board_id}/list-order",
    response_model=None,
    responses={404: {"model": ErrorResponse}},
)
def update_list_order(
    board_id: str, payload: ListOrderRequest, session: Session = Depends(get_session)
) -> Union[dict, JSONResponse]:
    board = session.get(BoardRecord, board_id)
    if not board:
        return error_response("not_found", "Board not found.", 404)
    board_list_ids = [board_list.id for board_list in board.lists]
    if sorted(board_list_ids) != sorted(payload.listIds):
        return error_response("validation_error", "List ids do not match board.", 400)
    for position, list_id in enumerate(payload.listIds):
        board_list = session.get(BoardList, list_id)
        if board_list:
            board_list.position = position
    session.commit()
    return {"success": True}


@router.post(
    "/boards/{board_id}/lists",
    response_model=Board,
    response_model_exclude_none=True,
    responses={404: {"model": ErrorResponse}},
)
def create_list(
    board_id: str, payload: ListCreateRequest, session: Session = Depends(get_session)
) -> Union[Board, JSONResponse]:
    board = session.get(BoardRecord, board_id)
    if not board:
        return error_response("not_found", "Board not found.", 404)
    position = len(board.lists)
    new_list = BoardList(
        id=generate_id("list"),
        guid=str(uuid4()),
        board_id=board_id,
        title=payload.title.strip(),
        is_process_done=bool(payload.isProcessDone),
        position=position,
    )
    session.add(new_list)
    session.commit()
    session.refresh(board)
    return board_to_model(board)


@router.patch(
    "/lists/{list_id}",
    response_model=Board,
    response_model_exclude_none=True,
    responses={404: {"model": ErrorResponse}},
)
def update_list(
    list_id: str, payload: ListUpdateRequest, session: Session = Depends(get_session)
) -> Union[Board, JSONResponse]:
    board_list = session.get(BoardList, list_id)
    if not board_list:
        return error_response("not_found", "List not found.", 404)
    if payload.title is not None:
        board_list.title = payload.title.strip()
    if payload.isProcessDone is not None:
        board_list.is_process_done = payload.isProcessDone
    session.commit()
    board = session.get(BoardRecord, board_list.board_id)
    if not board:
        return error_response("not_found", "Board not found.", 404)
    return board_to_model(board)


@router.delete(
    "/lists/{list_id}",
    response_model=None,
    responses={404: {"model": ErrorResponse}},
)
def delete_list(
    list_id: str, session: Session = Depends(get_session)
) -> Union[dict, JSONResponse]:
    board_list = session.get(BoardList, list_id)
    if not board_list:
        return error_response("not_found", "List not found.", 404)
    session.execute(delete(ListCard).where(ListCard.list_id == list_id))
    session.delete(board_list)
    session.commit()
    delete_orphan_cards(session)
    session.commit()
    return {"success": True}


@router.patch(
    "/lists/{list_id}/card-order",
    response_model=None,
    responses={404: {"model": ErrorResponse}},
)
def update_card_order(
    list_id: str, payload: CardOrderRequest, session: Session = Depends(get_session)
) -> Union[dict, JSONResponse]:
    board_list = session.get(BoardList, list_id)
    if not board_list:
        return error_response("not_found", "List not found.", 404)
    list_card_ids = [item.card_id for item in board_list.list_cards]
    if sorted(list_card_ids) != sorted(payload.cardIds):
        return error_response("validation_error", "Card ids do not match list.", 400)
    for position, card_id in enumerate(payload.cardIds):
        list_card = session.get(ListCard, {"list_id": list_id, "card_id": card_id})
        if list_card:
            list_card.position = position
    session.commit()
    return {"success": True}


@router.post(
    "/cards",
    response_model=Card,
    response_model_exclude_none=True,
)
def create_card(
    payload: CardCreateRequest, session: Session = Depends(get_session)
) -> Union[Card, JSONResponse]:
    title_error = validate_card_title(payload.title)
    if title_error:
        return error_response("validation_error", title_error, 400)
    now = utc_now()
    card = CardRecord(
        id=generate_id("card"),
        guid=str(uuid4()),
        title=payload.title.strip(),
        description=payload.description or "",
        status_state="incomplete",
        completed_at=None,
        created_at=now,
        updated_at=now,
    )
    session.add(card)
    session.commit()
    session.refresh(card)
    return card_to_model(card)


@router.patch(
    "/cards/{card_id}",
    response_model=Card,
    response_model_exclude_none=True,
    responses={404: {"model": ErrorResponse}},
)
def update_card(
    card_id: str, payload: CardUpdateRequest, session: Session = Depends(get_session)
) -> Union[Card, JSONResponse]:
    card = session.get(CardRecord, card_id)
    if not card:
        return error_response("not_found", "Card not found.", 404)
    if payload.title is not None:
        title_error = validate_card_title(payload.title)
        if title_error:
            return error_response("validation_error", title_error, 400)
        card.title = payload.title.strip()
    if payload.description is not None:
        card.description = payload.description
    if payload.statusState is not None:
        card.status_state = payload.statusState
    if payload.completedAt is not None:
        card.completed_at = datetime.fromisoformat(
            payload.completedAt.replace("Z", "+00:00")
        )
    card.updated_at = utc_now()
    session.commit()
    session.refresh(card)
    return card_to_model(card)


@router.delete(
    "/cards/{card_id}",
    response_model=None,
    responses={404: {"model": ErrorResponse}},
)
def delete_card(
    card_id: str, session: Session = Depends(get_session)
) -> Union[dict, JSONResponse]:
    card = session.get(CardRecord, card_id)
    if not card:
        return error_response("not_found", "Card not found.", 404)
    session.execute(delete(ListCard).where(ListCard.card_id == card_id))
    session.execute(
        delete(CardRelationshipRecord).where(
            or_(
                CardRelationshipRecord.parent_card_id == card_id,
                CardRelationshipRecord.child_card_id == card_id,
            )
        )
    )
    session.execute(
        delete(CardCommentRecord).where(CardCommentRecord.card_id == card_id)
    )
    session.delete(card)
    session.commit()
    return {"success": True}


@router.post(
    "/lists/{list_id}/cards",
    response_model=None,
    responses={404: {"model": ErrorResponse}},
)
def attach_card_to_list(
    list_id: str,
    payload: ListCardAttachRequest,
    session: Session = Depends(get_session),
) -> Union[dict, JSONResponse]:
    board_list = session.get(BoardList, list_id)
    if not board_list:
        return error_response("not_found", "List not found.", 404)
    card = session.get(CardRecord, payload.cardId)
    if not card:
        return error_response("not_found", "Card not found.", 404)
    existing = session.get(ListCard, {"list_id": list_id, "card_id": payload.cardId})
    if existing:
        return error_response("validation_error", "Card already on list.", 400)
    position = len(board_list.list_cards)
    session.add(ListCard(list_id=list_id, card_id=payload.cardId, position=position))
    session.commit()
    return {"success": True}


@router.delete(
    "/lists/{list_id}/cards/{card_id}",
    response_model=None,
    responses={404: {"model": ErrorResponse}},
)
def remove_card_from_list(
    list_id: str, card_id: str, session: Session = Depends(get_session)
) -> Union[dict, JSONResponse]:
    list_card = session.get(ListCard, {"list_id": list_id, "card_id": card_id})
    if not list_card:
        return error_response("not_found", "Card not found on list.", 404)
    session.delete(list_card)
    session.commit()
    return {"success": True}
