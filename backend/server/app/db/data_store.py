import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

from backend.server.app.core.config import get_settings


class DataStore:
    def __init__(self, data_path: Optional[Path] = None) -> None:
        settings = get_settings()
        self._data_path = data_path or settings.data_json_path
        self._data: Dict[str, Any] = self._load_data()
        self._ensure_guids()

    def _load_data(self) -> Dict[str, Any]:
        raw = json.loads(self._data_path.read_text(encoding="utf-8"))
        raw.setdefault("boards", [])
        raw.setdefault("cards", [])
        raw.setdefault("cardRelationships", [])
        raw.setdefault("boardRelationships", [])
        return raw

    def _ensure_guids(self) -> None:
        board_guid_by_id: Dict[str, str] = {}
        list_guid_by_id: Dict[str, str] = {}
        card_guid_by_id: Dict[str, str] = {}
        comment_guid_by_id: Dict[str, str] = {}

        for board in self._data["boards"]:
            board_id = board.get("id")
            if board_id:
                board_guid_by_id.setdefault(board_id, str(uuid4()))
                board["guid"] = board_guid_by_id[board_id]
            for board_list in board.get("lists", []):
                list_id = board_list.get("id")
                if list_id:
                    list_guid_by_id.setdefault(list_id, str(uuid4()))
                    board_list["guid"] = list_guid_by_id[list_id]

        for card in self._data["cards"]:
            card_id = card.get("id")
            if card_id:
                card_guid_by_id.setdefault(card_id, str(uuid4()))
                card["guid"] = card_guid_by_id[card_id]
            for comment in card.get("comments", []):
                comment_id = comment.get("id")
                if comment_id:
                    comment_guid_by_id.setdefault(comment_id, str(uuid4()))
                    comment["guid"] = comment_guid_by_id[comment_id]

    def get_board_summaries(self) -> List[Dict[str, Any]]:
        summaries = []
        for board in self._data["boards"]:
            summaries.append(
                {
                    "id": board["id"],
                    "guid": board.get("guid"),
                    "title": board["title"],
                    "createdAt": board["createdAt"],
                    "description": board.get("description"),
                    "pinned": board.get("pinned"),
                    "archived": board.get("archived"),
                    "rollupsEnabled": board.get("rollupsEnabled"),
                }
            )
        return summaries

    def get_board(self, board_id: str) -> Optional[Dict[str, Any]]:
        for board in self._data["boards"]:
            if board.get("id") == board_id:
                return board
        return None

    def get_board_snapshot(self, board_id: str) -> Optional[Dict[str, Any]]:
        board = self.get_board(board_id)
        if not board:
            return None
        return {
            "board": board,
            "cards": self._data["cards"],
            "cardRelationships": self._data["cardRelationships"],
            "boardRelationships": self._data["boardRelationships"],
        }
