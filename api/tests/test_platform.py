"""Health checks, request ids, background tasks, stats and the safety net for crashes."""

from collections.abc import Callable
from typing import Any

from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from tests.conftest import AUTH

MakeBook = Callable[..., dict[str, Any]]


def test_health_and_ready(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/ready").json() == {"status": "ready", "database": "up"}


def test_every_response_has_a_request_id(client: TestClient) -> None:
    generated = client.get("/health").headers["x-request-id"]
    assert len(generated) == 32

    echoed = client.get("/health", headers={"X-Request-ID": "trace-abc-123"})
    assert echoed.headers["x-request-id"] == "trace-abc-123"

    unsafe = client.get("/health", headers={"X-Request-ID": "<script>"})
    assert unsafe.headers["x-request-id"] != "<script>"


def test_finishing_a_book_records_activity(client: TestClient, make_book: MakeBook) -> None:
    book = make_book(status="reading")

    response = client.post(f"/books/{book['id']}/finish", json={"rating": 5}, headers=AUTH)

    assert response.status_code == 200
    assert response.json()["status"] == "done"
    assert response.json()["rating"] == 5
    # TestClient runs background tasks before returning, so the entry is already there.
    feed = client.get("/activity").json()
    assert feed["total"] == 1
    assert feed["items"][0]["message"] == "Finished Dune (5/5)"


def test_stats_count_every_status(client: TestClient, make_book: MakeBook) -> None:
    make_book(status="done", rating=4)
    make_book(status="done", rating=5)
    make_book(status="reading")

    assert client.get("/stats").json() == {
        "total": 3,
        "by_status": {"want": 0, "reading": 1, "done": 2},
        "average_rating": 4.5,
    }


def test_stats_on_an_empty_shelf(client: TestClient) -> None:
    assert client.get("/stats").json()["average_rating"] is None


def test_crashes_become_a_safe_500(settings: Settings) -> None:
    app = create_app(settings)

    @app.get("/boom")
    def boom() -> None:
        raise RuntimeError("secret database detail")

    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/boom")

    assert response.status_code == 500
    assert response.json()["title"] == "Something went wrong on our side"
    assert "secret" not in response.text


def test_openapi_lists_the_api(client: TestClient) -> None:
    schema = client.get("/openapi.json").json()

    assert schema["info"]["title"] == "Shelf"
    assert "/books/{book_id}/finish" in schema["paths"]
    assert "APIKeyHeader" in schema["components"]["securitySchemes"]
