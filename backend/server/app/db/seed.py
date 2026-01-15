from __future__ import annotations

import json
from datetime import datetime
from uuid import uuid4

from sqlalchemy.orm import Session

from backend.server.app.core.config import Settings
from backend.server.app.db.models import (
    Board,
    BoardList,
    BoardRelationship,
    Card,
    CardComment,
    CardRelationship,
    ListCard,
)


def _parse_datetime(value: str) -> datetime:
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)


def seed_database(session: Session, settings: Settings) -> None:
    print(f"Seeding database at {settings.db_path} from {settings.data_json_path}")
    payload = json.loads(settings.data_json_path.read_text(encoding="utf-8"))
    boards = payload.get("boards", [])
    cards = payload.get("cards", [])
    card_relationships = payload.get("cardRelationships", [])
    board_relationships = payload.get("boardRelationships", [])

    board_guid: dict[str, str] = {}
    list_guid: dict[str, str] = {}
    card_guid: dict[str, str] = {}

    for board in boards:
        board_id = board["id"]
        board_guid.setdefault(board_id, str(uuid4()))
        session.add(
            Board(
                id=board_id,
                guid=board_guid[board_id],
                title=board["title"],
                description=board.get("description"),
                created_at=_parse_datetime(board["createdAt"]),
                pinned=board.get("pinned"),
                archived=board.get("archived"),
                rollups_enabled=board.get("rollupsEnabled"),
            )
        )

        for position, board_list in enumerate(board.get("lists", [])):
            list_id = board_list["id"]
            list_guid.setdefault(list_id, str(uuid4()))
            session.add(
                BoardList(
                    id=list_id,
                    guid=list_guid[list_id],
                    board_id=board_id,
                    title=board_list["title"],
                    is_process_done=bool(board_list.get("isProcessDone")),
                    position=position,
                )
            )
            for card_position, card_id in enumerate(board_list.get("cardIds", [])):
                session.add(
                    ListCard(
                        list_id=list_id,
                        card_id=card_id,
                        position=card_position,
                    )
                )

    for card in cards:
        card_id = card["id"]
        card_guid.setdefault(card_id, str(uuid4()))
        status = card.get("status") or {}
        session.add(
            Card(
                id=card_id,
                guid=card_guid[card_id],
                title=card["title"],
                description=card.get("description") or "",
                status_state=status.get("state") or "incomplete",
                completed_at=_parse_datetime(status["completedAt"])
                if status.get("completedAt")
                else None,
                created_at=_parse_datetime(card["createdAt"]),
                updated_at=_parse_datetime(card["updatedAt"]),
            )
        )
        for comment in card.get("comments", []):
            session.add(
                CardComment(
                    id=comment["id"],
                    guid=str(uuid4()),
                    card_id=card_id,
                    message=comment["message"],
                    author_type=comment["authorType"],
                    created_at=_parse_datetime(comment["createdAt"]),
                )
            )

    for relationship in card_relationships:
        session.add(
            CardRelationship(
                parent_card_id=relationship["parentCardId"],
                child_card_id=relationship["childCardId"],
                created_at=_parse_datetime(relationship["createdAt"]),
            )
        )

    for relationship in board_relationships:
        session.add(
            BoardRelationship(
                parent_board_id=relationship["parentBoardId"],
                child_board_id=relationship["childBoardId"],
                created_at=_parse_datetime(relationship["createdAt"]),
            )
        )
