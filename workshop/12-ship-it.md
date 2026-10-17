# Ship it

> Health checks, a small Docker image, production settings and a checklist.

**Time:** 20 minutes

## Goal

Package Shelf as a container that is safe to run in production, and know what to check first.

## Two health checks

```python
@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
def ready(session: SessionDep, response: Response) -> dict[str, str]:
    try:
        session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "unavailable", "database": "down"}
    return {"status": "ready", "database": "up"}
```

- **Liveness** (`/health`): is the process alive? If not, restart it.
- **Readiness** (`/ready`): can it serve? If not, stop sending it traffic for a while.

## The Docker image

`api/Dockerfile` has two stages:

1. **build:** copy `pyproject.toml` and `uv.lock`, run `uv sync --frozen --no-dev`. Only exact,
   locked versions, and no test tools.
2. **run:** a clean `python:3.13-slim` with just the app and its virtualenv, running as a
   **non-root** user, with the database in `/data`.

```bash
cd api
docker build -t shelf-api .
docker run --rm -p 8000:8000 \
  -e SHELF_API_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(32))')" \
  -v shelf-data:/data shelf-api
```

The image sets `SHELF_ENVIRONMENT=production`, so it **refuses to start** with the dev key. Try
it without `-e SHELF_API_KEY=...` and read the error.

## Where to run it

Any host that runs a container works: Fly.io, Railway, Render, Google Cloud Run, AWS App Runner
or your own server. Give it the environment variables, a volume for `/data` (or a Postgres
`SHELF_DATABASE_URL`) and point its health check at `/ready`.

## Production checklist

- [ ] `SHELF_API_KEY` is long, random and stored in the host's secret manager.
- [ ] HTTPS in front (the host or a proxy does this). Never send keys over plain HTTP.
- [ ] A real database with backups when more than one instance runs.
- [ ] Migrations (Alembic) instead of `create_all`.
- [ ] CORS lists exact origins, if browsers call the API.
- [ ] Logs go somewhere searchable; alerts on 5xx rates.
- [ ] Dependencies pinned (`uv.lock`) and updated on purpose.
- [ ] CI runs lint, types, tests and the Docker build on every push (see
      `.github/workflows/ci.yml`).

## Check it works

```bash
docker run -d --name shelf -p 8000:8000 -e SHELF_API_KEY=a-long-random-secret shelf-api
curl http://127.0.0.1:8000/ready
docker rm -f shelf
```

## Exercise

You made it. Pick the tracker idea from chapter 01 and build its first resource (one model, one
router, two tests) using Shelf as your template. Share it with the group.
