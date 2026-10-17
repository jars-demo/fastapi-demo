# Errors that help

> One error format for everything: clear for clients, safe for you.

**Time:** 15 minutes

## Goal

Return errors people can act on, in one consistent shape, without leaking internals.

## One shape for every error

Shelf follows **RFC 9457, Problem Details**. Every error looks like this, with the content type
`application/problem+json`:

```json
{
  "type": "about:blank",
  "title": "Book not found",
  "status": 404,
  "detail": "book 999 not found",
  "request_id": "6f1c0e2b9a8d4f7e8c3b2a1d0e9f8a7b"
}
```

`request_id` matches the `X-Request-ID` header and the log line for that request (chapter 10),
so a bug report can be traced in seconds.

## Raise a meaningful exception

Routes do not build error responses by hand. They raise:

```python
def get_book_or_404(session: Session, book_id: int) -> Book:
    book = session.get(Book, book_id)
    if book is None:
        raise NotFoundError("book", book_id)
    return book
```

## Handlers turn exceptions into responses

`app/errors.py` registers one handler per kind of error:

```python
@app.exception_handler(NotFoundError)
async def not_found(request: Request, exc: NotFoundError) -> JSONResponse:
    return problem(request, 404, f"{exc.resource.capitalize()} not found", str(exc))
```

- **Validation errors** (422) list every field that needs attention, with a plain message.
- **HTTP errors** (401, 405, ...) keep their status and headers.
- **Anything unexpected** becomes a calm 500:

```python
@app.exception_handler(Exception)
async def unexpected(request: Request, exc: Exception) -> JSONResponse:
    # Log the type only: messages can contain user data. The request id links log and reply.
    log.error("unhandled error", extra={"error": type(exc).__name__, ...})
    return problem(request, 500, "Something went wrong on our side")
```

The client never sees a stack trace, a SQL statement or a file path.

## Check it works

```bash
curl -i http://127.0.0.1:8000/books/999
```

Look at the status line, the `content-type` and the `x-request-id` header, and compare the id
with the one in the body.

## Exercise

Add a `ConflictError` and use it in `create_book` to refuse a second book with exactly the same
title and author (status 409, title "Book already on your shelf").
