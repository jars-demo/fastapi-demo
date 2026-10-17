# FastAPI Workshop

**Build Shelf, a small reading-list API that is ready for the real world, one short chapter at a
time.** Validation, a database, helpful errors, API-key auth, tests, logs, background tasks and a
Docker image. No magic, just Python with type hints.

[![CI](https://github.com/jars-demo/fastapi-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/jars-demo/fastapi-demo/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-0f766e.svg)](LICENSE)

Workshop site: **[fastapi.jishanahmed.in](https://fastapi.jishanahmed.in)**

## Start in a minute

You need [uv](https://docs.astral.sh/uv/) and git. uv installs Python 3.13 and the exact package
versions for you.

```bash
git clone https://github.com/jars-demo/fastapi-demo.git
cd fastapi-demo/api
uv sync
uv run uvicorn app.main:app --reload
```

Open <http://127.0.0.1:8000/docs>, click **Authorize**, enter `dev-key-change-me`, and try every
route from your browser.

## What you build

| Method | Path                      | What it does                       | Key |
| ------ | ------------------------- | ---------------------------------- | --- |
| GET    | `/books`                  | List books, with filters and pages |     |
| GET    | `/books/{book_id}`        | One book                           |     |
| POST   | `/books`                  | Add a book                         | yes |
| PATCH  | `/books/{book_id}`        | Change only what you send          | yes |
| DELETE | `/books/{book_id}`        | Remove a book                      | yes |
| POST   | `/books/{book_id}/finish` | Mark done, rate it, log it         | yes |
| GET    | `/stats`                  | Counts and average rating          |     |
| GET    | `/activity`               | What happened recently             |     |
| GET    | `/health`, `/ready`       | Is it up? Can it serve?            |     |

## The workshop

Twelve chapters, about three hours in total. Each one has a goal, short steps, a way to check it
worked, and an exercise.

| #   | Chapter                                                                | Minutes |
| --- | ---------------------------------------------------------------------- | ------- |
| 01  | [Why FastAPI, and what we build](workshop/01-why-fastapi.md)           | 10      |
| 02  | [Set up and run it](workshop/02-set-up.md)                             | 10      |
| 03  | [Routes, path and query parameters](workshop/03-routes-and-params.md)  | 15      |
| 04  | [Pydantic models and validation](workshop/04-pydantic-models.md)       | 20      |
| 05  | [A real database with SQLAlchemy](workshop/05-database.md)             | 20      |
| 06  | [Dependencies and settings](workshop/06-dependencies.md)               | 15      |
| 07  | [Errors that help](workshop/07-errors.md)                              | 15      |
| 08  | [Protect writes with an API key](workshop/08-auth.md)                  | 15      |
| 09  | [Test it with pytest](workshop/09-testing.md)                          | 20      |
| 10  | [Middleware, request ids and logs](workshop/10-middleware-and-logs.md) | 15      |
| 11  | [Background tasks and async](workshop/11-background-and-async.md)      | 15      |
| 12  | [Ship it](workshop/12-ship-it.md)                                      | 20      |

Running it for a group? See the [facilitator guide](docs/running-the-workshop.md).

## Repository layout

```text
api/            the Shelf API (FastAPI, SQLAlchemy, pytest, Dockerfile)
workshop/       the twelve chapters, in Markdown
src/            the workshop site (Next.js), which renders workshop/
tests/          site tests (Vitest and Playwright)
docs/           architecture, facilitator guide, changelog
```

## Checks

```bash
# API
cd api
uv run ruff check . && uv run ruff format --check .
uv run mypy
uv run pytest

# Site
npm ci
npm run verify     # lint, types, format, unit tests, production build
npm run test:e2e
```

CI runs all of these on every push, and also builds the Docker image and checks that it refuses
the dev key in production.

## Stack

FastAPI 0.142, Pydantic 2.13, pydantic-settings 2.15, SQLAlchemy 2.1, Uvicorn 0.54, Python 3.13,
uv. Site: Next.js 16, React 19, Tailwind CSS 4.

## Licence

[MIT](LICENSE). Use it for your own workshops, classes and teams.
