from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Board(Base):
    __tablename__ = "boards"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    guid: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    pinned: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    archived: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    rollups_enabled: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    lists: Mapped[list["BoardList"]] = relationship(
        "BoardList",
        back_populates="board",
        cascade="all, delete-orphan",
        order_by="BoardList.position",
    )


class BoardList(Base):
    __tablename__ = "lists"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    guid: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    board_id: Mapped[str] = mapped_column(ForeignKey("boards.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    is_process_done: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    board: Mapped[Board] = relationship("Board", back_populates="lists")
    list_cards: Mapped[list["ListCard"]] = relationship(
        "ListCard",
        back_populates="list",
        cascade="all, delete-orphan",
        order_by="ListCard.position",
    )


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    guid: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status_state: Mapped[str] = mapped_column(
        String, nullable=False, default="incomplete"
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    comments: Mapped[list["CardComment"]] = relationship(
        "CardComment", back_populates="card", cascade="all, delete-orphan"
    )
    list_cards: Mapped[list["ListCard"]] = relationship(
        "ListCard", back_populates="card", cascade="all, delete-orphan"
    )


class CardComment(Base):
    __tablename__ = "card_comments"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    guid: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    card_id: Mapped[str] = mapped_column(
        ForeignKey("cards.id"), primary_key=True, nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    author_type: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    card: Mapped[Card] = relationship("Card", back_populates="comments")


class ListCard(Base):
    __tablename__ = "list_cards"

    list_id: Mapped[str] = mapped_column(ForeignKey("lists.id"), primary_key=True)
    card_id: Mapped[str] = mapped_column(ForeignKey("cards.id"), primary_key=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    list: Mapped[BoardList] = relationship("BoardList", back_populates="list_cards")
    card: Mapped[Card] = relationship("Card", back_populates="list_cards")

    __table_args__ = (UniqueConstraint("list_id", "card_id", name="uix_list_card"),)


class CardRelationship(Base):
    __tablename__ = "card_relationships"

    parent_card_id: Mapped[str] = mapped_column(
        ForeignKey("cards.id"), primary_key=True
    )
    child_card_id: Mapped[str] = mapped_column(ForeignKey("cards.id"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class BoardRelationship(Base):
    __tablename__ = "board_relationships"

    parent_board_id: Mapped[str] = mapped_column(
        ForeignKey("boards.id"), primary_key=True
    )
    child_board_id: Mapped[str] = mapped_column(
        ForeignKey("boards.id"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
