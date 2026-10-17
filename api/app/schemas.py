"""Request and response models (chapter 04).

Pydantic validates everything that comes in and shapes everything that goes out. Database rows
never leave the API directly; they are converted to these models first.
"""

from datetime import UTC, datetime
from typing import Annotated, Any, Self

from pydantic import (
    AfterValidator,
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    StringConstraints,
    field_validator,
    model_validator,
)

from app.models import Status


def _normalise(value: Any) -> Any:
    return value.strip().lower() if isinstance(value, str) else value


# BeforeValidator runs first, so "  Sci-Fi " is cleaned up before the pattern is checked.
TagName = Annotated[
    str, BeforeValidator(_normalise), StringConstraints(pattern=r"^[a-z0-9-]{1,30}$")
]
Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
Author = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
Rating = Annotated[int, Field(ge=1, le=5, description="1 to 5 stars, only for finished books")]


def _as_utc(value: datetime) -> datetime:
    # SQLite forgets time zones. Every time we store is UTC, so say so in the response.
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value


UtcDatetime = Annotated[datetime, AfterValidator(_as_utc)]


def _unique(tags: list[str]) -> list[str]:
    return sorted(set(tags))


class BookCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: Title
    author: Author
    status: Status = Status.WANT
    rating: Rating | None = None
    tags: Annotated[list[TagName], Field(max_length=10)] = []

    _dedupe_tags = field_validator("tags")(_unique)

    @model_validator(mode="after")
    def rating_only_when_done(self) -> Self:
        if self.rating is not None and self.status is not Status.DONE:
            raise ValueError("a rating can only be given to a finished (done) book")
        return self


class BookUpdate(BaseModel):
    """Every field is optional: only the fields you send are changed."""

    model_config = ConfigDict(extra="forbid")

    title: Title | None = None
    author: Author | None = None
    status: Status | None = None
    rating: Rating | None = None
    tags: Annotated[list[TagName], Field(max_length=10)] | None = None

    @field_validator("tags")
    @classmethod
    def dedupe(cls, tags: list[str] | None) -> list[str] | None:
        return None if tags is None else _unique(tags)


class FinishBook(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rating: Rating | None = None


class BookRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    author: str
    status: Status
    rating: int | None
    tags: list[str]
    created_at: UtcDatetime
    updated_at: UtcDatetime

    @field_validator("tags", mode="before")
    @classmethod
    def tag_names(cls, value: Any) -> Any:
        # Database rows hold Tag objects; the API returns plain names.
        return [getattr(tag, "name", tag) for tag in value]


class Page[ItemT: BaseModel](BaseModel):
    items: list[ItemT]
    total: int
    limit: int
    offset: int


class Stats(BaseModel):
    total: int
    by_status: dict[Status, int]
    average_rating: float | None


class ActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    book_id: int | None
    message: str
    created_at: UtcDatetime


class Problem(BaseModel):
    """RFC 9457 problem details, used for every error (chapter 07)."""

    type: str = "about:blank"
    title: str
    status: int
    detail: str | None = None
    request_id: str | None = None
    errors: list[dict[str, Any]] | None = None
