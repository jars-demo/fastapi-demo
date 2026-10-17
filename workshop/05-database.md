# A real database with SQLAlchemy

> Tables as Python classes, one session per request, and queries that read like sentences.

**Time:** 20 minutes

## Goal

Understand how Shelf stores books, and write a query of your own.

## Engine and sessions

`app/db.py` makes two things:

- an **engine**: the connection to the database (SQLite file `shelf.db` by default);
- a **session factory**: each request gets its own session, a short conversation with the
  database that is committed or thrown away.

```python
def make_engine(url: str) -> Engine:
    if url.startswith("sqlite"):
        # SQLite connections are used across FastAPI's worker threads.
        connect_args = {"check_same_thread": False}
        ...
```

Swap `SHELF_DATABASE_URL` for a Postgres URL later and nothing else needs to change.

## Tables are classes

`app/models.py` uses SQLAlchemy 2.0's typed style. `Mapped[...]` gives your editor and mypy the
real types:

```python
class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    status: Mapped[Status] = mapped_column(..., default=Status.WANT, index=True)
    rating: Mapped[int | None] = mapped_column(Integer, default=None)

    tags: Mapped[list["Tag"]] = relationship(
        back_populates="book", cascade="all, delete-orphan", lazy="selectin", order_by="Tag.name"
    )
```

`cascade="all, delete-orphan"` means: delete a book and its tags go too. `lazy="selectin"` loads
the tags of a whole page of books in one extra query instead of one per book.

Tables are created when the app starts (`Base.metadata.create_all` in `main.py`). That is fine
for a workshop. Real projects use migrations (Alembic) so changes are versioned.

## Queries read like sentences

From `list_books` in `routers/books.py`:

```python
query = select(Book)
if status_filter is not None:
    query = query.where(Book.status == status_filter)
if tag is not None:
    query = query.where(Book.tags.any(Tag.name == tag))
if q is not None:
    pattern = f"%{q}%"
    query = query.where(or_(Book.title.ilike(pattern), Book.author.ilike(pattern)))
```

Values are always passed as **parameters**, never pasted into SQL text, so a search for
`'; DROP TABLE books; --` is just a strange title, not an attack.

## Writing

```python
book = Book(title=payload.title, author=payload.author, ...)
session.add(book)
session.commit()
session.refresh(book)
return book
```

## Check it works

Add two books in `/docs` (remember **Authorize**), stop the server, start it again, and list
books: they are still there, in `api/shelf.db`. Delete that file to start fresh.

## Exercise

Add a `?sort=title` option to `GET /books` that orders by title instead of newest first. Hint:
`query.order_by(Book.title)`.
