# Routes, path and query parameters

> Decorators map URLs to functions; type hints turn strings into checked values.

**Time:** 15 minutes

## Goal

Read and write routes, and know where each part of a request ends up in your function.

## A route is a decorated function

```python
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
```

- `@router.get("/health")` says: for `GET /health`, call this function.
- The return value is turned into JSON for you.
- `tags` groups routes together in `/docs`.

Routers keep related routes in one file (`routers/books.py`). `main.py` plugs them in with
`app.include_router(...)`. A router can share a prefix: `APIRouter(prefix="/books")`.

## Path parameters

```python
@router.get("/{book_id}", response_model=BookRead)
def get_book(book_id: int, session: SessionDep) -> Book:
    return get_book_or_404(session, book_id)
```

`{book_id}` in the path matches the `book_id` argument. Because it is typed `int`, a request to
`/books/abc` is refused with a clear error before your function runs.

## Query parameters

Arguments that are not in the path come from the query string (`?status=reading&q=dune`):

```python
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
```

- A default of `None` makes it optional.
- `Query(...)` adds rules (`min_length`) and a description for the docs.
- `alias="status"` keeps the URL friendly while the Python name avoids clashing with the
  imported `status` module.
- `Status` is an enum, so `?status=lost` is refused automatically.

## Check it works

With the server running:

```bash
curl "http://127.0.0.1:8000/books?status=reading&limit=5"
curl -i http://127.0.0.1:8000/books/abc     # 422, book_id must be an integer
curl -i "http://127.0.0.1:8000/books?status=lost"   # 422, not a valid status
```

## Exercise

Add a tiny route to `routers/health.py`:

```python
@router.get("/hello/{name}")
def hello(name: str, shout: bool = False) -> dict[str, str]:
    text = f"Hello, {name}!"
    return {"message": text.upper() if shout else text}
```

Try `/hello/ada` and `/hello/ada?shout=true`. Then remove it again.
