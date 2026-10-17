# Background tasks and async

> Reply fast, finish the rest later, and know when to write async def.

**Time:** 15 minutes

## Goal

Run work after the response, and choose between `def` and `async def` with confidence.

## Background tasks

Finishing a book should feel instant. Writing the activity entry can wait a moment:

```python
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
    ...
    background.add_task(
        record_activity, request.app.state.session_factory, book.id, f"Finished {book.title}{stars}"
    )
    return book
```

The task runs **after** the response is sent. It opens its **own** session, because the
request's session is already closed by then:

```python
def record_activity(factory: sessionmaker[Session], book_id: int, message: str) -> None:
    """Runs after the response. It opens its own session: the request's one is already closed."""
    with factory() as session:
        session.add(Activity(book_id=book_id, message=message))
        session.commit()
```

Background tasks run in the same process. They are perfect for small follow-ups (a log entry, a
cache refresh, a webhook). For heavy or must-not-be-lost work (emails, video, payments), use a
real queue such as Celery, RQ or arq.

## def or async def?

| Your route mostly...                                            | Write                      | Why                                                                 |
| --------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| calls sync libraries (SQLAlchemy sync, `requests`, files)       | `def`                      | FastAPI runs it in a thread pool, so it never blocks other requests |
| awaits async libraries (`httpx2.AsyncClient`, async DB drivers) | `async def`                | Thousands of waiting requests share one thread cheaply              |
| does heavy CPU work                                             | `def`, or a worker process | Neither style makes CPU work faster                                 |

The one mistake to avoid: a **sync, slow call inside `async def`**. It blocks the event loop and
every other request waits. Shelf uses sync SQLAlchemy, so its routes are plain `def`, as the
comment in `routers/stats.py` says.

## Check it works

1. In `/docs`, add a book, then call **POST /books/{book_id}/finish** with `{"rating": 5}`.
2. Call **GET /activity**: the entry is there.

## Exercise

Make `record_activity` also log a line with `logging.getLogger("shelf")`. Then add an
`async def` route `GET /slow` that does `await asyncio.sleep(2)`, open it in two tabs at once,
and notice they finish together, not one after the other.
