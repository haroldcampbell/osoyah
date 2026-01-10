from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterable, Literal, cast
from uuid import uuid4

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from backend.server.app.db.models import (
    Board as BoardRecord,
    Card as CardRecord,
    CardComment as CardCommentRecord,
    CardRelationship as CardRelationshipRecord,
    ListCard,
)
from backend.server.app.schemas import (
    Board,
    BoardList as BoardListModel,
    Card,
    CardComment,
    CardStatus,
)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def format_datetime(value: datetime | None) -> str | None:
    if value is None:
        return None
    return (
        value.astimezone(timezone.utc)
        .isoformat(timespec="milliseconds")
        .replace("+00:00", "Z")
    )


def format_required_datetime(value: datetime) -> str:
    return format_datetime(value) or ""


def generate_id(prefix: str) -> str:
    return f"{prefix}-{uuid4()}"


def board_to_model(board: BoardRecord) -> Board:
    lists: list[BoardListModel] = []
    for board_list in board.lists:
        card_ids = [list_card.card_id for list_card in board_list.list_cards]
        lists.append(
            BoardListModel(
                id=board_list.id,
                guid=board_list.guid,
                title=board_list.title,
                cardIds=card_ids,
                isProcessDone=board_list.is_process_done,
            )
        )
    return Board(
        id=board.id,
        guid=board.guid,
        title=board.title,
        createdAt=format_required_datetime(board.created_at),
        description=board.description,
        pinned=board.pinned,
        archived=board.archived,
        rollupsEnabled=board.rollups_enabled,
        lists=lists,
    )


def card_to_model(card: CardRecord) -> Card:
    comments = [
        CardComment(
            id=comment.id,
            guid=comment.guid,
            message=comment.message,
            createdAt=format_required_datetime(comment.created_at),
            authorType=cast(Literal["user", "system", "bot"], comment.author_type),
        )
        for comment in card.comments
    ]
    return Card(
        id=card.id,
        guid=card.guid,
        title=card.title,
        description=card.description,
        createdAt=format_required_datetime(card.created_at),
        updatedAt=format_required_datetime(card.updated_at),
        comments=comments,
        status=CardStatus(
            state=cast(Literal["incomplete", "completed"], card.status_state),
            completedAt=format_datetime(card.completed_at),
        ),
    )


def validate_board_title(title: str) -> str | None:
    trimmed = title.strip()
    if len(trimmed) < 3 or len(trimmed) > 40:
        return "Board name must be between 3 and 40 characters."
    if trimmed.isdigit():
        return "Board name cannot be all numbers."
    return None


def validate_board_description(description: str | None) -> str | None:
    if description is None:
        return None
    trimmed = description.strip()
    if len(trimmed) > 30:
        return "Board description must be 30 characters or less."
    return None


def validate_card_title(title: str) -> str | None:
    trimmed = title.strip()
    if len(trimmed) < 3 or len(trimmed) > 90:
        return "Card title must be between 3 and 90 characters."
    return None


def delete_orphan_cards(
    session: Session, card_ids: Iterable[str] | None = None
) -> None:
    query = select(CardRecord.id).outerjoin(ListCard).group_by(CardRecord.id)
    query = query.having(func.count(ListCard.card_id) == 0)
    if card_ids:
        query = query.where(CardRecord.id.in_(list(card_ids)))
    orphans = [row[0] for row in session.execute(query).all()]
    if not orphans:
        return
    session.execute(
        delete(CardRelationshipRecord).where(
            CardRelationshipRecord.parent_card_id.in_(orphans)
            | CardRelationshipRecord.child_card_id.in_(orphans)
        )
    )
    session.execute(
        delete(CardCommentRecord).where(CardCommentRecord.card_id.in_(orphans))
    )
    session.execute(delete(CardRecord).where(CardRecord.id.in_(orphans)))
