from datetime import datetime, timezone

import httpx
import pytest
from sqlalchemy import delete, select

from backend.server.app.main import app
from backend.server.app.db.models import (
    Board,
    CardComment,
    CardRelationship,
    ListCard,
)
from backend.server.app.db.session import SessionLocal


def _make_client() -> httpx.AsyncClient:
    transport = httpx.ASGITransport(app=app)  # type: ignore[arg-type]
    return httpx.AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.anyio
async def test_board_crud_flow() -> None:
    async with _make_client() as client:
        create = await client.post(
            "/api/boards", json={"title": "Backend Board", "description": "Seeded"}
        )
        assert create.status_code == 200
        board = create.json()
        board_id = board["id"]
        assert board["guid"]

        update = await client.patch(
            f"/api/boards/{board_id}",
            json={
                "title": "Backend Board Updated",
                "description": "Updated",
                "pinned": True,
                "archived": False,
                "rollupsEnabled": True,
            },
        )
        assert update.status_code == 200
        updated = update.json()
        assert updated["title"] == "Backend Board Updated"
        assert updated["guid"] == board["guid"]

        remove = await client.delete(f"/api/boards/{board_id}")
        assert remove.status_code == 200


@pytest.mark.anyio
async def test_list_and_card_ordering() -> None:
    async with _make_client() as client:
        board = await client.post("/api/boards", json={"title": "Order Board"})
        board_id = board.json()["id"]

        await client.post(f"/api/boards/{board_id}/lists", json={"title": "List A"})
        list_b = await client.post(
            f"/api/boards/{board_id}/lists", json={"title": "List B"}
        )
        lists = list_b.json()["lists"]
        list_ids = [lists[0]["id"], lists[1]["id"]]
        reorder = await client.patch(
            f"/api/boards/{board_id}/list-order", json={"listIds": list_ids[::-1]}
        )
        assert reorder.status_code == 200

        card = await client.post("/api/cards", json={"title": "Card A"})
        card_id = card.json()["id"]
        assert card.json()["guid"]
        attach = await client.post(
            f"/api/lists/{list_ids[0]}/cards", json={"cardId": card_id}
        )
        assert attach.status_code == 200

        order = await client.patch(
            f"/api/lists/{list_ids[0]}/card-order", json={"cardIds": [card_id]}
        )
        assert order.status_code == 200

        remove = await client.delete(f"/api/lists/{list_ids[0]}")
        assert remove.status_code == 200

        await client.delete(f"/api/boards/{board_id}")


@pytest.mark.anyio
async def test_remove_card_from_list_deletes_orphan() -> None:
    async with _make_client() as client:
        board = await client.post("/api/boards", json={"title": "Orphan Board"})
        board_id = board.json()["id"]
        list_response = await client.post(
            f"/api/boards/{board_id}/lists", json={"title": "List A"}
        )
        list_id = list_response.json()["lists"][0]["id"]
        card = await client.post("/api/cards", json={"title": "Orphan Card"})
        card_id = card.json()["id"]
        await client.post(f"/api/lists/{list_id}/cards", json={"cardId": card_id})

        detach = await client.delete(f"/api/lists/{list_id}/cards/{card_id}")
        assert detach.status_code == 200

        update = await client.patch(
            f"/api/cards/{card_id}",
            json={"title": "Still Exists"},
        )
        assert update.status_code == 200

        await client.delete(f"/api/cards/{card_id}")
        await client.delete(f"/api/boards/{board_id}")


@pytest.mark.anyio
async def test_validation_errors() -> None:
    async with _make_client() as client:
        too_short = await client.post("/api/boards", json={"title": "Hi"})
        assert too_short.status_code == 400
        assert too_short.json()["error"]["code"] == "validation_error"

        numeric_title = await client.post("/api/boards", json={"title": "12345"})
        assert numeric_title.status_code == 400

        long_desc = await client.post(
            "/api/boards",
            json={"title": "Valid Title", "description": "x" * 31},
        )
        assert long_desc.status_code == 400

        card_title = await client.post("/api/cards", json={"title": "No"})
        assert card_title.status_code == 400


@pytest.mark.anyio
async def test_order_validation_errors() -> None:
    async with _make_client() as client:
        board = await client.post("/api/boards", json={"title": "Order Error Board"})
        board_id = board.json()["id"]

        await client.post(f"/api/boards/{board_id}/lists", json={"title": "List A"})
        list_b = await client.post(
            f"/api/boards/{board_id}/lists", json={"title": "List B"}
        )
        list_ids = [item["id"] for item in list_b.json()["lists"]]
        bad_list = await client.patch(
            f"/api/boards/{board_id}/list-order",
            json={"listIds": list_ids + ["list-missing"]},
        )
        assert bad_list.status_code == 400

        card = await client.post("/api/cards", json={"title": "Card A"})
        card_id = card.json()["id"]
        await client.post(f"/api/lists/{list_ids[0]}/cards", json={"cardId": card_id})
        bad_card = await client.patch(
            f"/api/lists/{list_ids[0]}/card-order",
            json={"cardIds": [card_id, "card-missing"]},
        )
        assert bad_card.status_code == 400

        await client.delete(f"/api/boards/{board_id}")


@pytest.mark.anyio
async def test_attach_validation_errors() -> None:
    async with _make_client() as client:
        board = await client.post("/api/boards", json={"title": "Attach Board"})
        board_id = board.json()["id"]
        list_response = await client.post(
            f"/api/boards/{board_id}/lists", json={"title": "List A"}
        )
        list_id = list_response.json()["lists"][0]["id"]
        card = await client.post("/api/cards", json={"title": "Attach Card"})
        card_id = card.json()["id"]

        attach = await client.post(
            f"/api/lists/{list_id}/cards", json={"cardId": card_id}
        )
        assert attach.status_code == 200

        duplicate = await client.post(
            f"/api/lists/{list_id}/cards", json={"cardId": card_id}
        )
        assert duplicate.status_code == 400

        missing_card = await client.post(
            f"/api/lists/{list_id}/cards", json={"cardId": "card-missing"}
        )
        assert missing_card.status_code == 404

        missing_list = await client.post(
            "/api/lists/list-missing/cards", json={"cardId": card_id}
        )
        assert missing_list.status_code == 404

        await client.delete(f"/api/boards/{board_id}")


@pytest.mark.anyio
async def test_update_board_validation_errors() -> None:
    async with _make_client() as client:
        board = await client.post("/api/boards", json={"title": "Board Title"})
        board_id = board.json()["id"]

        missing = await client.patch(
            "/api/boards/missing-board",
            json={"title": "Updated", "description": "Updated"},
        )
        assert missing.status_code == 404

        bad_title = await client.patch(
            f"/api/boards/{board_id}",
            json={"title": "12", "description": "Updated"},
        )
        assert bad_title.status_code == 400

        bad_description = await client.patch(
            f"/api/boards/{board_id}",
            json={"title": "Updated", "description": "x" * 31},
        )
        assert bad_description.status_code == 400

        await client.delete(f"/api/boards/{board_id}")


@pytest.mark.anyio
async def test_board_and_list_missing_errors() -> None:
    async with _make_client() as client:
        missing_delete = await client.delete("/api/boards/missing-board")
        assert missing_delete.status_code == 404

        missing_list_order = await client.patch(
            "/api/boards/missing-board/list-order",
            json={"listIds": []},
        )
        assert missing_list_order.status_code == 404

        missing_create_list = await client.post(
            "/api/boards/missing-board/lists", json={"title": "List A"}
        )
        assert missing_create_list.status_code == 404

        missing_list_update = await client.patch(
            "/api/lists/list-missing", json={"title": "Updated"}
        )
        assert missing_list_update.status_code == 404

        missing_list_delete = await client.delete("/api/lists/list-missing")
        assert missing_list_delete.status_code == 404

        missing_card_order = await client.patch(
            "/api/lists/list-missing/card-order", json={"cardIds": []}
        )
        assert missing_card_order.status_code == 404


@pytest.mark.anyio
async def test_update_list_missing_board() -> None:
    async with _make_client() as client:
        board = await client.post("/api/boards", json={"title": "List Board"})
        board_id = board.json()["id"]
        list_response = await client.post(
            f"/api/boards/{board_id}/lists", json={"title": "List A"}
        )
        list_id = list_response.json()["lists"][0]["id"]

        with SessionLocal() as session:
            session.execute(delete(Board).where(Board.id == board_id))
            session.commit()

        missing_board = await client.patch(
            f"/api/lists/{list_id}", json={"title": "Updated"}
        )
        assert missing_board.status_code == 404


@pytest.mark.anyio
async def test_update_card_status_and_validation_errors() -> None:
    async with _make_client() as client:
        card = await client.post("/api/cards", json={"title": "Card"})
        card_id = card.json()["id"]

        bad_title = await client.patch(
            f"/api/cards/{card_id}",
            json={"title": "No"},
        )
        assert bad_title.status_code == 400

        completed_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        updated = await client.patch(
            f"/api/cards/{card_id}",
            json={"statusState": "completed", "completedAt": completed_at},
        )
        assert updated.status_code == 200
        payload = updated.json()
        assert payload["status"]["state"] == "completed"
        assert payload["status"]["completedAt"]
        assert payload["status"]["completedAt"].endswith("Z")


@pytest.mark.anyio
async def test_delete_card_missing_and_cascades() -> None:
    async with _make_client() as client:
        missing = await client.delete("/api/cards/card-missing")
        assert missing.status_code == 404

        board = await client.post("/api/boards", json={"title": "Delete Board"})
        board_id = board.json()["id"]
        list_response = await client.post(
            f"/api/boards/{board_id}/lists", json={"title": "List A"}
        )
        list_id = list_response.json()["lists"][0]["id"]
        card = await client.post("/api/cards", json={"title": "Delete Card"})
        card_id = card.json()["id"]
        sibling = await client.post("/api/cards", json={"title": "Sibling Card"})
        sibling_id = sibling.json()["id"]
        await client.post(f"/api/lists/{list_id}/cards", json={"cardId": card_id})

        comment_id = "comment-delete-1"
        now = datetime.now(timezone.utc)
        with SessionLocal() as session:
            session.add(
                CardComment(
                    id=comment_id,
                    guid="guid-delete-comment",
                    card_id=card_id,
                    message="Test comment",
                    author_type="user",
                    created_at=now,
                )
            )
            session.add(
                CardRelationship(
                    parent_card_id=card_id,
                    child_card_id=sibling_id,
                    created_at=now,
                )
            )
            session.commit()

        delete = await client.delete(f"/api/cards/{card_id}")
        assert delete.status_code == 200

        with SessionLocal() as session:
            comment = session.execute(
                select(CardComment).where(
                    CardComment.id == comment_id, CardComment.card_id == card_id
                )
            ).scalar_one_or_none()
            relationship = session.get(
                CardRelationship,
                {"parent_card_id": card_id, "child_card_id": sibling_id},
            )
            list_card = session.get(ListCard, {"list_id": list_id, "card_id": card_id})
            assert comment is None
            assert relationship is None
            assert list_card is None

        await client.delete(f"/api/boards/{board_id}")


@pytest.mark.anyio
async def test_remove_card_missing_from_list() -> None:
    async with _make_client() as client:
        board = await client.post("/api/boards", json={"title": "Remove Board"})
        board_id = board.json()["id"]
        list_response = await client.post(
            f"/api/boards/{board_id}/lists", json={"title": "List A"}
        )
        list_id = list_response.json()["lists"][0]["id"]
        card = await client.post("/api/cards", json={"title": "Detached Card"})
        card_id = card.json()["id"]

        missing = await client.delete(f"/api/lists/{list_id}/cards/{card_id}")
        assert missing.status_code == 404

        await client.delete(f"/api/boards/{board_id}")
