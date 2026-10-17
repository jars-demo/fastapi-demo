# Why FastAPI, and what we build

> Meet Shelf, the reading-list API we build together, and why FastAPI fits it.

**Time:** 10 minutes

## Goal

Know what FastAPI gives you, what Shelf does, and how the next eleven chapters fit together.

## What FastAPI is

FastAPI is a Python framework for building HTTP APIs. You write normal Python functions with type
hints, and FastAPI turns those hints into three things at once:

- **Validation.** Wrong input is rejected before your code runs.
- **Conversion.** `"42"` in a URL becomes the integer `42` in your function.
- **Documentation.** A live, clickable API page at `/docs`, always in sync with the code.

It is built on two solid libraries: **Starlette** (the web part) and **Pydantic** (the data part).

## What we build: Shelf

Shelf keeps a reading list. Each book has a title, an author, a status (`want`, `reading` or
`done`), an optional 1 to 5 rating, and some tags.

| Method | Path                 | What it does                       | Key needed |
| ------ | -------------------- | ---------------------------------- | ---------- |
| GET    | `/books`             | List books, with filters and pages | no         |
| GET    | `/books/{id}`        | One book                           | no         |
| POST   | `/books`             | Add a book                         | yes        |
| PATCH  | `/books/{id}`        | Change some fields                 | yes        |
| DELETE | `/books/{id}`        | Remove a book                      | yes        |
| POST   | `/books/{id}/finish` | Mark done, rate it, log it         | yes        |
| GET    | `/stats`             | Counts and average rating          | no         |
| GET    | `/activity`          | What happened recently             | no         |
| GET    | `/health`, `/ready`  | Is it up? Can it serve?            | no         |

Small enough to finish in an afternoon, real enough to ship: it has a database, auth, tests,
logs, error handling and a Docker image.

## The map

```
api/
  app/
    main.py         create_app(): wires everything together
    config.py       settings from the environment
    db.py           database engine and sessions
    models.py       tables (SQLAlchemy)
    schemas.py      request and response shapes (Pydantic)
    deps.py         dependencies: session, pagination, API key
    errors.py       one helpful error format
    middleware.py   request ids and access logs
    routers/        health.py, books.py, stats.py
  tests/            pytest, one fresh database per test
  Dockerfile
```

Every file starts with a comment that names the chapter it belongs to.

## Check it works

Nothing to run yet. Read the table above and predict: what should `GET /books/999` return when
there is no book 999? You will find out in chapter 07.

## Exercise

Think of one thing **you** would track with an API like this (films, recipes, gym sessions). Keep
it in mind; every exercise works for your idea too.
