from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Dict[str, object] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    error: ErrorDetail


class BoardList(BaseModel):
    id: str
    guid: str
    title: str
    cardIds: List[str]
    isProcessDone: bool


class BoardSummary(BaseModel):
    id: str
    guid: str
    title: str
    createdAt: str
    description: Optional[str] = None
    pinned: Optional[bool] = None
    archived: Optional[bool] = None
    rollupsEnabled: Optional[bool] = None


class Board(BoardSummary):
    lists: List[BoardList]


class CardComment(BaseModel):
    id: str
    guid: str
    message: str
    createdAt: str
    authorType: Literal["user", "system", "bot"]


class CardStatus(BaseModel):
    state: Literal["incomplete", "completed"]
    completedAt: Optional[str] = None


class Card(BaseModel):
    id: str
    guid: str
    title: str
    description: str
    createdAt: str
    updatedAt: str
    comments: List[CardComment]
    status: CardStatus


class CardRelationship(BaseModel):
    childCardId: str
    parentCardId: str
    createdAt: str


class BoardRelationship(BaseModel):
    childBoardId: str
    parentBoardId: str
    createdAt: str


class BoardSummariesResponse(BaseModel):
    boards: List[BoardSummary]


class BoardSnapshotResponse(BaseModel):
    board: Board
    cards: List[Card]
    cardRelationships: List[CardRelationship]
    boardRelationships: List[BoardRelationship]
