"""Initial schema.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-01-10
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "boards",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("guid", sa.String(), nullable=False, unique=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("pinned", sa.Boolean(), nullable=True),
        sa.Column("archived", sa.Boolean(), nullable=True),
        sa.Column("rollups_enabled", sa.Boolean(), nullable=True),
    )

    op.create_table(
        "lists",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("guid", sa.String(), nullable=False, unique=True),
        sa.Column("board_id", sa.String(), sa.ForeignKey("boards.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("is_process_done", sa.Boolean(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
    )

    op.create_table(
        "cards",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("guid", sa.String(), nullable=False, unique=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status_state", sa.String(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "card_comments",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("guid", sa.String(), nullable=False, unique=True),
        sa.Column("card_id", sa.String(), sa.ForeignKey("cards.id"), primary_key=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("author_type", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "list_cards",
        sa.Column("list_id", sa.String(), sa.ForeignKey("lists.id"), primary_key=True),
        sa.Column("card_id", sa.String(), sa.ForeignKey("cards.id"), primary_key=True),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.UniqueConstraint("list_id", "card_id", name="uix_list_card"),
    )

    op.create_table(
        "card_relationships",
        sa.Column(
            "parent_card_id", sa.String(), sa.ForeignKey("cards.id"), primary_key=True
        ),
        sa.Column(
            "child_card_id", sa.String(), sa.ForeignKey("cards.id"), primary_key=True
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "board_relationships",
        sa.Column(
            "parent_board_id",
            sa.String(),
            sa.ForeignKey("boards.id"),
            primary_key=True,
        ),
        sa.Column(
            "child_board_id",
            sa.String(),
            sa.ForeignKey("boards.id"),
            primary_key=True,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("board_relationships")
    op.drop_table("card_relationships")
    op.drop_table("list_cards")
    op.drop_table("card_comments")
    op.drop_table("cards")
    op.drop_table("lists")
    op.drop_table("boards")
