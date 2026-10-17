# AGENTS.md

Guidance for AI coding agents and developers working in this repository. Humans: start with
[README.md](README.md).

## What this is

A hands-on FastAPI workshop. Learners build **Shelf**, a small production-shaped reading-list API
(`api/`), guided by twelve chapters (`workshop/`). A Next.js 16 site at the repository root
renders the chapters. **The API and the chapters are the product.** The site only presents them.

## Map

```text
api/app/main.py            create_app(settings): wires settings, DB, errors, middleware, routers
api/app/config.py          Settings (SHELF_ env vars, SecretStr key, dev key refused in production)
api/app/db.py              Base, make_engine, make_session_factory
api/app/models.py          Book, Tag, Activity, Status
api/app/schemas.py         BookCreate, BookUpdate, FinishBook, BookRead, Page[T], Stats, Problem
api/app/deps.py            SessionDep, SettingsDep, PaginationDep, require_api_key / ApiKey
api/app/errors.py          NotFoundError and the problem+json handlers
api/app/middleware.py      request ids, JSON access logs
api/app/routers/           health.py, books.py, stats.py
api/tests/                 pytest; conftest.py builds a fresh in-memory app per test
api/Dockerfile             two-stage, non-root image
workshop/NN-slug.md        chapters; the site reads them at build time
src/lib/workshop.ts        chapter loader; src/lib/site.ts endpoints, features, demo exchanges
src/components/            Shell, Shelfie, ApiDemo, MethodPill, MarkdownPre, CopyButton
tests/unit/, tests/e2e/    Vitest (jsdom) and Playwright for the site
docs/                      architecture.md, running-the-workshop.md, CHANGELOG.md
```

## Commands

```bash
# API (from api/)
uv sync
uv run uvicorn app.main:app --reload
uv run ruff check . && uv run ruff format --check .
uv run mypy
uv run pytest

# Site (from the repository root)
npm ci
npm run dev
npm run check      # lint + typecheck + format:check + unit tests
npm run verify     # check + production build: run before every push
npm run test:e2e
```

## Rules

1. **Docs follow code.** A changed function, file path, setting or response means updating the
   chapter that teaches it, `src/lib/site.ts` and the README. `tests/unit/workshop.test.ts`
   fails if a chapter names a missing file or the site lists a missing route.
2. **Teachable first.** Prefer the plain, idiomatic FastAPI way over clever code. Every module
   starts with a docstring naming its chapter.
3. **Secure by default.** Writes need the API key; keys are `SecretStr` and compared in constant
   time; errors never leak internals; logs never include bodies, query strings or headers.
4. **Tested.** New behaviour comes with a pytest test, including the failure paths. ruff and
   strict mypy stay clean.
5. **Pinned.** Exact versions in `pyproject.toml`, `uv.lock` and `package.json`, each released at
   least 14 days before it is added.
6. **Writing style.** Plain English, short sentences, no em dashes in code, docs or commits.
7. **Git.** Conventional Commits, one logical change per commit, no AI attribution trailers.
   Never push, tag or deploy unless asked.

## Skills

Follows the [JARS Skills](https://github.com/jars-demo/jars-skills) playbooks: `write-tests`,
`accessibility`, `code-review`, `commit-style`, `changelog` and `release`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
