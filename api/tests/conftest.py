"""Shared test fixtures (chapter 09).

Each test gets a fresh app with its own in-memory database, so tests never share state and never
touch your real shelf.db.
"""

from collections.abc import Callable, Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.config import Settings
from app.main import create_app

TEST_KEY = "test-key-123"
AUTH = {"X-API-Key": TEST_KEY}


@pytest.fixture
def settings() -> Settings:
    return Settings(
        environment="test",
        database_url="sqlite://",
        api_key=SecretStr(TEST_KEY),
        log_level="WARNING",
    )


@pytest.fixture
def client(settings: Settings) -> Iterator[TestClient]:
    # `with` runs the lifespan, which creates the tables.
    with TestClient(create_app(settings)) as test_client:
        yield test_client


@pytest.fixture
def make_book(client: TestClient) -> Callable[..., dict[str, Any]]:
    def _make(**fields: Any) -> dict[str, Any]:
        body = {"title": "Dune", "author": "Frank Herbert", **fields}
        response = client.post("/books", json=body, headers=AUTH)
        assert response.status_code == 201, response.text
        book: dict[str, Any] = response.json()
        return book

    return _make
