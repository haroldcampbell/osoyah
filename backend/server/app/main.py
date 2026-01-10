from typing import Union

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from .data_store import DataStore
from .models import (
    Board,
    BoardSnapshotResponse,
    BoardSummariesResponse,
    BoardSummary,
    ErrorResponse,
)

app = FastAPI(title="Osoyah API", version="0.1.0")
data_store = DataStore()


def error_response(code: str, message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "details": {}}},
    )


@app.get(
    "/api/boards",
    response_model=BoardSummariesResponse,
    response_model_exclude_none=True,
)
def list_boards() -> BoardSummariesResponse:
    summaries = [BoardSummary(**board) for board in data_store.get_board_summaries()]
    return BoardSummariesResponse(boards=summaries)


@app.get(
    "/api/boards/{board_id}",
    response_model=Board,
    response_model_exclude_none=True,
    responses={404: {"model": ErrorResponse}},
)
def get_board(board_id: str) -> Union[Board, JSONResponse]:
    board = data_store.get_board(board_id)
    if not board:
        return error_response("not_found", "Board not found.", 404)
    return Board(**board)


@app.get(
    "/api/boards/{board_id}/snapshot",
    response_model=BoardSnapshotResponse,
    response_model_exclude_none=True,
    responses={404: {"model": ErrorResponse}},
)
def get_board_snapshot(board_id: str) -> Union[BoardSnapshotResponse, JSONResponse]:
    snapshot = data_store.get_board_snapshot(board_id)
    if not snapshot:
        return error_response("not_found", "Board not found.", 404)
    return BoardSnapshotResponse(**snapshot)
