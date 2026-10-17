"""Dependencies (chapter 06) and API-key auth (chapter 08).

FastAPI calls these for each request and passes the results into your path functions. That keeps
routes short and makes every piece swappable in tests.
"""

import secrets
from collections.abc import Iterator
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, Query, Request, Security, status
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session

from app.config import Settings


def get_app_settings(request: Request) -> Settings:
    settings: Settings = request.app.state.settings
    return settings


def get_session(request: Request) -> Iterator[Session]:
    """One database session per request, always closed afterwards."""
    with request.app.state.session_factory() as session:
        yield session


SettingsDep = Annotated[Settings, Depends(get_app_settings)]
SessionDep = Annotated[Session, Depends(get_session)]


@dataclass(frozen=True)
class Pagination:
    limit: int
    offset: int


def pagination(
    limit: Annotated[int, Query(ge=1, le=100, description="How many items to return")] = 20,
    offset: Annotated[int, Query(ge=0, description="How many items to skip")] = 0,
) -> Pagination:
    return Pagination(limit=limit, offset=offset)


PaginationDep = Annotated[Pagination, Depends(pagination)]

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
