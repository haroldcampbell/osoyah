from __future__ import annotations

import httpx
import pytest

from backend.server.app.main import app


def _make_client() -> httpx.AsyncClient:
    transport = httpx.ASGITransport(app=app)  # type: ignore[arg-type]
    return httpx.AsyncClient(transport=transport, base_url="http://test")


async def _create_board(client: httpx.AsyncClient, title: str) -> str:
    response = await client.post("/api/boards", json={"title": title})
    assert response.status_code == 200
    return response.json()["id"]


@pytest.mark.anyio
async def test_card_relationship_validation_and_cycle() -> None:
    async with _make_client() as client:
        parent = await client.post("/api/cards", json={"title": "Parent Card"})
        child = await client.post("/api/cards", json={"title": "Child Card"})
        parent_id = parent.json()["id"]
        child_id = child.json()["id"]

        missing_parent = await client.post(
            "/api/cards/card-missing/relationships",
            json={"childCardId": child_id},
        )
        assert missing_parent.status_code == 404

        missing_child = await client.post(
            f"/api/cards/{parent_id}/relationships",
            json={"childCardId": "card-missing"},
        )
        assert missing_child.status_code == 404

        self_link = await client.post(
            f"/api/cards/{parent_id}/relationships",
            json={"childCardId": parent_id},
        )
        assert self_link.status_code == 400

        created = await client.post(
            f"/api/cards/{parent_id}/relationships",
            json={"childCardId": child_id},
        )
        assert created.status_code == 200

        duplicate = await client.post(
            f"/api/cards/{parent_id}/relationships",
            json={"childCardId": child_id},
        )
        assert duplicate.status_code == 400

        cycle = await client.post(
            f"/api/cards/{child_id}/relationships",
            json={"childCardId": parent_id},
        )
        assert cycle.status_code == 400

        snapshot = await client.get("/api/boards/board-missing/snapshot")
        assert snapshot.status_code == 404

        board = await _create_board(client, "Snapshot Board")
        snapshot = await client.get(f"/api/boards/{board}/snapshot")
        assert snapshot.status_code == 200
        relationships = snapshot.json()["cardRelationships"]
        assert any(
            item["parentCardId"] == parent_id
            and item["childCardId"] == child_id
            and item["createdAt"]
            for item in relationships
        )


@pytest.mark.anyio
async def test_board_relationship_depth_and_cycle() -> None:
    async with _make_client() as client:
        parent_id = await _create_board(client, "Parent Board")
        child_id = await _create_board(client, "Child Board")

        missing_parent = await client.post(
            "/api/boards/board-missing/relationships",
            json={"childBoardId": child_id},
        )
        assert missing_parent.status_code == 404

        missing_child = await client.post(
            f"/api/boards/{parent_id}/relationships",
            json={"childBoardId": "board-missing"},
        )
        assert missing_child.status_code == 404

        self_link = await client.post(
            f"/api/boards/{parent_id}/relationships",
            json={"childBoardId": parent_id},
        )
        assert self_link.status_code == 400

        created = await client.post(
            f"/api/boards/{parent_id}/relationships",
            json={"childBoardId": child_id},
        )
        assert created.status_code == 200

        duplicate = await client.post(
            f"/api/boards/{parent_id}/relationships",
            json={"childBoardId": child_id},
        )
        assert duplicate.status_code == 400

        cycle = await client.post(
            f"/api/boards/{child_id}/relationships",
            json={"childBoardId": parent_id},
        )
        assert cycle.status_code == 400

        board = await _create_board(client, "Depth Board 1")
        chain = [board]
        for index in range(2, 8):
            chain.append(await _create_board(client, f"Depth Board {index}"))
            response = await client.post(
                f"/api/boards/{chain[index - 2]}/relationships",
                json={"childBoardId": chain[index - 1]},
            )
            assert response.status_code == 200

        too_deep = await client.post(
            f"/api/boards/{chain[-1]}/relationships",
            json={"childBoardId": await _create_board(client, "Depth Board 8")},
        )
        assert too_deep.status_code == 400

        snapshot = await client.get(f"/api/boards/{parent_id}/snapshot")
        assert snapshot.status_code == 200
        relationships = snapshot.json()["boardRelationships"]
        assert any(
            item["parentBoardId"] == parent_id
            and item["childBoardId"] == child_id
            and item["createdAt"]
            for item in relationships
        )


@pytest.mark.anyio
async def test_delete_relationships() -> None:
    async with _make_client() as client:
        parent = await client.post("/api/cards", json={"title": "Parent"})
        child = await client.post("/api/cards", json={"title": "Child"})
        parent_id = parent.json()["id"]
        child_id = child.json()["id"]
        await client.post(
            f"/api/cards/{parent_id}/relationships",
            json={"childCardId": child_id},
        )

        missing_card = await client.delete(
            f"/api/cards/{parent_id}/relationships/card-missing"
        )
        assert missing_card.status_code == 404

        deleted = await client.delete(
            f"/api/cards/{parent_id}/relationships/{child_id}"
        )
        assert deleted.status_code == 200

        parent_board = await _create_board(client, "Parent Board")
        child_board = await _create_board(client, "Child Board")
        await client.post(
            f"/api/boards/{parent_board}/relationships",
            json={"childBoardId": child_board},
        )

        missing_board = await client.delete(
            f"/api/boards/{parent_board}/relationships/board-missing"
        )
        assert missing_board.status_code == 404

        deleted_board = await client.delete(
            f"/api/boards/{parent_board}/relationships/{child_board}"
        )
        assert deleted_board.status_code == 200
