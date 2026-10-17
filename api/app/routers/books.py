"""Books: the heart of Shelf (chapters 03 to 11).

Reads are public. Writes need an API key. Finishing a book records an activity entry in a
background task, after the response has been sent.
"""

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Query, Request, status
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, sessionmaker

from app.deps import ApiKey, PaginationDep, SessionDep
from app.errors import NotFoundError
from app.models import Activity, Book, Status, Tag
from app.schemas import BookCreate, BookRead, BookUpdate, FinishBook, Page, TagName

router = APIRouter(prefix="/books", tags=["books"])


def get_book_or_404(session: Session, book_id: int) -> Book:
    book = session.get(Book, book_id)
    if book is None:
        raise NotFoundError("book", book_id)
    return book


def record_activity(factory: sessionmaker[Session], book_id: int, message: str) -> None:
    """Runs after the response. It opens its own session: the request's one is already closed."""
    with factory() as session:
        session.add(Activity(book_id=book_id, message=message))
        session.commit()


@router.get("", response_model=Page[BookRead])
def list_books(
    session: SessionDep,
    page: PaginationDep,
    status_filter: Annotated[Status | None, Query(alias="status")] = None,
    tag: Annotated[TagName | None, Query(description="Only books with this tag")] = None,
    q: Annotated[
        str | None, Query(min_length=1, max_length=100, description="Search title and author")
    ] = None,
) -> Page[BookRead]:
    query: Select[tuple[Book]] = select(Book)
    if status_filter is not None:
        query = query.where(Book.status == status_filter)
    if tag is not None:
        query = query.where(Book.tags.any(Tag.name == tag))
    if q is not None:
        pattern = f"%{q}%"
        query = query.where(or_(Book.title.ilike(pattern), Book.author.ilike(pattern)))

    total = session.scalar(select(func.count()).select_from(query.subquery())) or 0
    books = session.scalars(
        query.order_by(Book.created_at.desc(), Book.id.desc()).limit(page.limit).offset(page.offset)
    ).all()
    return Page[BookRead](
        items=[BookRead.model_validate(book) for book in books],
        total=total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/{book_id}", response_model=BookRead)
def get_book(book_id: int, session: SessionDep) -> Book:
    return get_book_or_404(session, book_id)


@router.post(
    "", response_model=BookRead, status_code=status.HTTP_201_CREATED, dependencies=[ApiKey]
)
def create_book(payload: BookCreate, session: SessionDep) -> Book:
    book = Book(
        title=payload.title,
        author=payload.author,
        status=payload.status,
        rating=payload.rating,
        tags=[Tag(name=name) for name in payload.tags],
    )
    session.add(book)
    session.commit()
    session.refresh(book)
    return book


@router.patch("/{book_id}", response_model=BookRead, dependencies=[ApiKey])
def update_book(book_id: int, payload: BookUpdate, session: SessionDep) -> Book:
    book = get_book_or_404(session, book_id)
    changes = payload.model_dump(exclude_unset=True)

    if "tags" in changes:
        names = changes.pop("tags") or []
        book.tags = [Tag(name=name) for name in names]
    for field, value in changes.items():
        if value is None and field in {"title", "author", "status"}:
            continue  # these columns can't be emptied
        setattr(book, field, value)

    if book.rating is not None and book.status is not Status.DONE:
        book.rating = None  # a rating only makes sense for a finished book

    session.commit()
    session.refresh(book)
    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[ApiKey])
def delete_book(book_id: int, session: SessionDep) -> None:
    book = get_book_or_404(session, book_id)
    session.delete(book)
    session.commit()


@router.post("/{book_id}/finish", response_model=BookRead, dependencies=[ApiKey])
def finish_book(
    book_id: int,
    payload: FinishBook,
    session: SessionDep,
    background: BackgroundTasks,
    request: Request,
) -> Book:
    book = get_book_or_404(session, book_id)
    book.status = Status.DONE
    book.rating = payload.rating
    session.commit()
    session.refresh(book)

    stars = f" ({payload.rating}/5)" if payload.rating else ""
    background.add_task(
        record_activity, request.app.state.session_factory, book.id, f"Finished {book.title}{stars}"
    )
    return book
