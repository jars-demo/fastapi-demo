# Protect writes with an API key

> Anyone can read your shelf; only you can change it.

**Time:** 15 minutes

## Goal

Require a key for every write, check it safely, and make it show up in `/docs`.

## The dependency

From `app/deps.py`:

```python
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False, description="Your API key")


def require_api_key(
    settings: SettingsDep,
    key: Annotated[str | None, Security(api_key_header)] = None,
) -> None:
    """Allow the request only with the right X-API-Key header. Compared in constant time."""
    expected = settings.api_key.get_secret_value()
    if key is None or not secrets.compare_digest(key.encode(), expected.encode()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A valid X-API-Key header is required",
            headers={"WWW-Authenticate": "ApiKey"},
        )


ApiKey = Depends(require_api_key)
```

Three details matter:

1. **`APIKeyHeader`** tells OpenAPI about the scheme, so `/docs` gets an **Authorize** button.
2. **`secrets.compare_digest`** takes the same time whether the first character or the last one
   is wrong, so an attacker cannot guess the key one character at a time by timing replies.
3. **401 with `WWW-Authenticate`** is the standard way to say "you need credentials".

## Use it on a route

The dependency returns nothing; it only blocks. So it goes in `dependencies=[...]`:

```python
@router.post(
    "", response_model=BookRead, status_code=status.HTTP_201_CREATED, dependencies=[ApiKey]
)
def create_book(payload: BookCreate, session: SessionDep) -> Book:
```

To protect a whole router at once: `APIRouter(dependencies=[ApiKey])`.

## Never ship the dev key

`Settings` refuses to start in production with the default key:

```python
@model_validator(mode="after")
def refuse_dev_key_in_production(self) -> Self:
    if self.environment == "production" and self.api_key.get_secret_value() == DEV_API_KEY:
        raise ValueError("SHELF_API_KEY must be set to a real secret in production")
    return self
```

Make a real key with `python -c "import secrets; print(secrets.token_urlsafe(32))"`.

## When to go further

An API key fits one owner or a few trusted services. For many users with their own data, use
OAuth2 with tokens (FastAPI has `OAuth2PasswordBearer` and a full guide). The shape stays the
same: a security dependency that either returns the user or raises 401.

## Check it works

```bash
curl -i -X POST http://127.0.0.1:8000/books -H "Content-Type: application/json" \
  -d '{"title":"Emma","author":"Jane Austen"}'
# 401

curl -X POST http://127.0.0.1:8000/books -H "X-API-Key: dev-key-change-me" \
  -H "Content-Type: application/json" -d '{"title":"Emma","author":"Jane Austen"}'
# 201
```

## Exercise

Set `SHELF_API_KEY=my-own-key` in `.env`, restart, and confirm the old key now gets a 401.
