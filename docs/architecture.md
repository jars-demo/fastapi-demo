# Architecture

Two independent parts share one repository:

1. **`api/`**: the Shelf API, the thing learners build. Python 3.13, FastAPI, SQLAlchemy 2.
2. **The site** (repository root): a Next.js 16 app that renders `workshop/*.md` as pages.

The site never calls the API. The workshop chapters are the bridge between them, and a unit test
(`tests/unit/workshop.test.ts`) checks that every file a chapter mentions and every endpoint the
site lists really exists in `api/`.

## The API

```text
request
  -> request-id middleware      sets request.state.request_id, logs one JSON line per request
  -> router (books, stats, health)
       -> dependencies          settings, a DB session, pagination, API key
       -> Pydantic validation   bad input stops here with a 422
       -> route function        SQLAlchemy queries
       -> response_model        shapes the output (BookRead, Page[...], Stats)
  -> background tasks           run after the response (activity entries)
errors anywhere -> handlers in errors.py -> application/problem+json
```

### Decisions

| Decision                                                       | Why                                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| App factory `create_app(settings)`                             | Tests build an app with an in-memory database and a test key, with no patching.      |
| Engine and session factory on `app.state`                      | Dependencies read them per app, so two apps never share a database.                  |
| Sync SQLAlchemy with plain `def` routes                        | Simplest correct model to teach. FastAPI runs sync routes in a thread pool.          |
| `create_all` at start-up                                       | Keeps the workshop short. Chapter 12 tells learners to use Alembic in real projects. |
| RFC 9457 problem details                                       | One documented error shape, with the request id for tracing.                         |
| API key in `X-API-Key`, compared with `secrets.compare_digest` | Right size for a single-owner API; constant-time comparison.                         |
| Dev key refused when `SHELF_ENVIRONMENT=production`            | A forgotten secret fails loudly at start-up instead of shipping.                     |
| Request ids accepted only if `^[A-Za-z0-9-]{8,64}$`            | Keeps caller-controlled text out of headers and logs.                                |
| Logs never include bodies, query strings or headers            | They can contain personal data or keys.                                              |
| Timestamps returned as UTC-aware                               | SQLite drops time zones; all stored times are UTC.                                   |

### Data model

```text
books     id, title, author, status (want|reading|done), rating (1-5, done only),
          created_at, updated_at
tags      (book_id, name)  primary key on both; deleted with the book
activity  id, book_id (set null if the book goes), message, created_at
```

## The site

- `src/lib/workshop.ts` reads `workshop/NN-slug.md` at build time: number and slug from the file
  name, title from `# `, summary from `> `, minutes from the `**Time:**` line.
- Every chapter page is prerendered with `generateStaticParams`.
- `src/lib/site.ts` holds the endpoint list, feature cards and the demo request/response pairs,
  which were captured from the real API.
- The only client components are `ApiDemo` (steps through examples, still under reduced motion)
  and `CopyButton`.

## Deployment

- **Site:** Vercel, zero config (the Next.js app is at the repository root).
- **API:** any container host, using `api/Dockerfile`. See chapter 12.
