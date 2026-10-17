# Dependencies and settings

> Let FastAPI hand each route what it needs: a session, pagination, settings.

**Time:** 15 minutes

## Goal

Write a dependency, reuse it everywhere, and read settings from the environment safely.

## A dependency is a function FastAPI calls for you

From `app/deps.py`:

```python
def get_session(request: Request) -> Iterator[Session]:
    """One database session per request, always closed afterwards."""
    with request.app.state.session_factory() as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
```

Any route that asks for `session: SessionDep` gets a fresh session. The code after `yield` runs
when the request is finished, so the session is always closed, even after an error.

## Dependencies can take parameters too

Pagination is the same everywhere, so it is written once:

```python
def pagination(
    limit: Annotated[int, Query(ge=1, le=100, description="How many items to return")] = 20,
    offset: Annotated[int, Query(ge=0, description="How many items to skip")] = 0,
) -> Pagination:
    return Pagination(limit=limit, offset=offset)


PaginationDep = Annotated[Pagination, Depends(pagination)]
```

`/books` and `/activity` both use `page: PaginationDep`, and both show `limit` and `offset` in
the docs with the same rules.

## Settings from the environment

`app/config.py` uses pydantic-settings. Every field can be set with a `SHELF_` variable or in a
`.env` file:

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SHELF_", env_file=".env", extra="ignore")

    environment: Literal["development", "test", "production"] = "development"
    database_url: str = "sqlite:///./shelf.db"
    api_key: SecretStr = SecretStr(DEV_API_KEY)
```

`SecretStr` prints as `**********`, so the key never ends up in a log by accident. You must call
`.get_secret_value()` on purpose to read it.

```bash
cp .env.example .env    # then edit .env; it is git-ignored
```

## Why this matters for tests

The app keeps its settings and session factory on `app.state`, and dependencies read them from
there. A test builds an app with an in-memory database and a test key, and every route uses
those without any code changes. You will see this in chapter 09.

## Check it works

```bash
curl "http://127.0.0.1:8000/books?limit=500"   # 422: limit must be 100 or less
```

## Exercise

Add a `max_page_size` setting (default 100) and make `pagination` refuse anything bigger.
Hint: a dependency can itself depend on `SettingsDep`.
