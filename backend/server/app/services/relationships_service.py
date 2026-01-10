from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from typing import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.server.app.db.models import BoardRelationship, CardRelationship


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def build_card_parent_map(
    relationships: Iterable[CardRelationship],
) -> dict[str, str]:
    return {item.child_card_id: item.parent_card_id for item in relationships}


def would_create_card_cycle(
    child_card_id: str,
    parent_card_id: str,
    parent_by_child: dict[str, str],
) -> bool:
    if child_card_id == parent_card_id:
        return True
    current_parent_id = parent_card_id
    visited = set[str]()
    while current_parent_id:
        if current_parent_id in visited:
            return True
        visited.add(current_parent_id)
        if current_parent_id == child_card_id:
            return True
        current_parent_id = parent_by_child.get(current_parent_id, "")
    return False


def load_card_relationships(session: Session) -> list[CardRelationship]:
    return list(session.execute(select(CardRelationship)).scalars().all())


def build_board_hierarchy_maps(
    relationships: Iterable[BoardRelationship],
) -> tuple[dict[str, str], dict[str, list[str]]]:
    parent_by_child: dict[str, str] = {}
    children_by_parent: dict[str, list[str]] = defaultdict(list)
    for item in relationships:
        parent_by_child[item.child_board_id] = item.parent_board_id
        if item.child_board_id not in children_by_parent[item.parent_board_id]:
            children_by_parent[item.parent_board_id].append(item.child_board_id)
    return parent_by_child, dict(children_by_parent)


def would_create_board_cycle(
    child_board_id: str,
    parent_board_id: str,
    parent_by_child: dict[str, str],
) -> bool:
    current_id: str | None = parent_board_id
    visited = set[str]()
    while current_id:
        if current_id == child_board_id:
            return True
        if current_id in visited:
            break
        visited.add(current_id)
        current_id = parent_by_child.get(current_id)
    return False


def get_board_depth(board_id: str, parent_by_child: dict[str, str]) -> int:
    depth = 1
    current_id: str | None = board_id
    visited = set[str]()
    while current_id and current_id in parent_by_child:
        if current_id in visited:
            break
        visited.add(current_id)
        current_id = parent_by_child.get(current_id)
        if current_id:
            depth += 1
    return depth


def get_board_subtree_height(
    board_id: str,
    children_by_parent: dict[str, list[str]],
    visited: set[str],
) -> int:
    if board_id in visited:
        return 0
    visited.add(board_id)
    children = children_by_parent.get(board_id, [])
    if not children:
        return 1
    child_heights = [
        get_board_subtree_height(child_id, children_by_parent, set(visited))
        for child_id in children
    ]
    return 1 + max(child_heights)
