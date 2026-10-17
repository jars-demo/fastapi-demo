"""Database tables (chapter 05).

A book has a status, an optional rating and tags. Finishing a book records an activity entry in
the background (chapter 11).
"""

from datetime import UTC, datetime
from enum import StrEnum

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class Status(StrEnum):
    WANT = "want"
    READING = "reading"
    DONE = "done"


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    author: Mapped[str] = mapped_column(String(120))
    status: Mapped[Status] = mapped_column(
        Enum(Status, native_enum=False, length=10, values_callable=lambda e: [m.value for m in e]),
        default=Status.WANT,
        index=True,
    )
    rating: Mapped[int | None] = mapped_column(Integer, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    tags: Mapped[list["Tag"]] = relationship(
        back_populates="book",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="Tag.name",
    )


class Tag(Base):
    __tablename__ = "tags"

    book_id: Mapped[int] = mapped_column(
        ForeignKey("books.id", ondelete="CASCADE"), primary_key=True
    )
    name: Mapped[str] = mapped_column(String(30), primary_key=True, index=True)

    book: Mapped[Book] = relationship(back_populates="tags")


class Activity(Base):
    __tablename__ = "activity"

    id: Mapped[int] = mapped_column(primary_key=True)
    book_id: Mapped[int | None] = mapped_column(
        ForeignKey("books.id", ondelete="SET NULL"), default=None
    )
    message: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
