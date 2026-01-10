import httpx
import pytest

from backend.server.app.main import app


def _make_client() -> httpx.AsyncClient:
    transport = httpx.ASGITransport(app=app)  # type: ignore[arg-type]
    return httpx.AsyncClient(transport=transport, base_url="http://test")


async def _get_first_board_id() -> str:
    async with _make_client() as client:
        response = await client.get("/api/boards")
    assert response.status_code == 200
    boards = response.json()["boards"]
    assert boards
    return boards[0]["id"]


@pytest.mark.anyio
async def test_get_boards_returns_summaries() -> None:
    async with _make_client() as client:
        response = await client.get("/api/boards")
    assert response.status_code == 200
    payload = response.json()
    assert "boards" in payload
    assert payload["boards"]
    board = payload["boards"][0]
    assert "lists" not in board
    assert "guid" in board


@pytest.mark.anyio
async def test_get_board_returns_lists() -> None:
    board_id = await _get_first_board_id()
    async with _make_client() as client:
        response = await client.get(f"/api/boards/{board_id}")
    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == board_id
    assert "lists" in payload
    if payload["lists"]:
        assert "cardIds" in payload["lists"][0]
        assert "guid" in payload["lists"][0]


@pytest.mark.anyio
async def test_get_board_snapshot_returns_full_payload() -> None:
    board_id = await _get_first_board_id()
    async with _make_client() as client:
        response = await client.get(f"/api/boards/{board_id}/snapshot")
    assert response.status_code == 200
    payload = response.json()
    assert "board" in payload
    assert "cards" in payload
    assert "cardRelationships" in payload
    assert "boardRelationships" in payload
    if payload["cards"]:
        card = payload["cards"][0]
        assert "guid" in card
        if card["comments"]:
            assert "guid" in card["comments"][0]


@pytest.mark.anyio
async def test_get_board_missing_returns_error_shape() -> None:
    async with _make_client() as client:
        response = await client.get("/api/boards/missing-board")
    assert response.status_code == 404
    payload = response.json()
    assert payload["error"]["code"] == "not_found"
    assert payload["error"]["message"] == "Board not found."


@pytest.mark.anyio
async def test_get_board_snapshot_missing_returns_error_shape() -> None:
    async with _make_client() as client:
        response = await client.get("/api/boards/missing-board/snapshot")
    assert response.status_code == 404
    payload = response.json()
    assert payload["error"]["code"] == "not_found"
    assert payload["error"]["message"] == "Board not found."
