from collections.abc import Callable
from typing import Any

from fastapi.testclient import TestClient

from tests.conftest import AUTH

MakeBook = Callable[..., dict[str, Any]]


def test_create_and_read_a_book(client: TestClient, make_book: MakeBook) -> None:
    book = make_book(title="  Piranesi ", author="Susanna Clarke", tags=["Fantasy", "fantasy"])

    assert book["title"] == "Piranesi"  # whitespace stripped
    assert book["status"] == "want"
    assert book["tags"] == ["fantasy"]  # lowercased and deduplicated

    fetched = client.get(f"/books/{book['id']}")
    assert fetched.status_code == 200
    assert fetched.json() == book


def test_missing_book_is_a_helpful_404(client: TestClient) -> None:
    response = client.get("/books/999")

    assert response.status_code == 404
    assert response.headers["content-type"] == "application/problem+json"
    body = response.json()
    assert body["title"] == "Book not found"
    assert body["request_id"] == response.headers["x-request-id"]


def test_path_param_must_be_an_int(client: TestClient) -> None:
    response = client.get("/books/abc")

    assert response.status_code == 422
    assert response.json()["errors"][0]["field"] == "book_id"


def test_list_filters_and_paginates(client: TestClient, make_book: MakeBook) -> None:
    make_book(title="Dune", author="Frank Herbert", tags=["sci-fi"])
    make_book(title="Emma", author="Jane Austen", status="reading", tags=["classic"])
    make_book(title="Hyperion", author="Dan Simmons", tags=["sci-fi"])

    everything = client.get("/books").json()
    assert everything["total"] == 3
    assert [b["title"] for b in everything["items"]] == ["Hyperion", "Emma", "Dune"]  # newest first

    assert client.get("/books", params={"status": "reading"}).json()["total"] == 1
    assert client.get("/books", params={"tag": "sci-fi"}).json()["total"] == 2
    assert client.get("/books", params={"q": "austen"}).json()["items"][0]["title"] == "Emma"

    page = client.get("/books", params={"limit": 1, "offset": 1}).json()
    assert page["total"] == 3
    assert [b["title"] for b in page["items"]] == ["Emma"]


def test_bad_query_params_are_rejected(client: TestClient) -> None:
    assert client.get("/books", params={"limit": 0}).status_code == 422
    assert client.get("/books", params={"limit": 101}).status_code == 422
    assert client.get("/books", params={"status": "lost"}).status_code == 422


def test_validation_errors_name_every_field(client: TestClient) -> None:
    response = client.post(
        "/books", json={"title": "", "author": "A", "rating": 9, "extra": 1}, headers=AUTH
    )

    assert response.status_code == 422
    body = response.json()
    assert body["title"] == "Some fields need attention"
    fields = {error["field"] for error in body["errors"]}
    assert {"title", "rating", "extra"} <= fields


def test_rating_needs_a_finished_book(client: TestClient) -> None:
    response = client.post(
        "/books", json={"title": "Dune", "author": "Frank Herbert", "rating": 5}, headers=AUTH
    )

    assert response.status_code == 422
    assert "finished" in response.json()["errors"][0]["message"]


def test_patch_changes_only_what_you_send(client: TestClient, make_book: MakeBook) -> None:
    book = make_book(tags=["sci-fi"])

    response = client.patch(f"/books/{book['id']}", json={"status": "reading"}, headers=AUTH)

    assert response.status_code == 200
    updated = response.json()
    assert updated["status"] == "reading"
    assert updated["title"] == book["title"]
    assert updated["tags"] == ["sci-fi"]


def test_patch_replaces_tags(client: TestClient, make_book: MakeBook) -> None:
    book = make_book(tags=["sci-fi"])

    response = client.patch(f"/books/{book['id']}", json={"tags": ["desert", "epic"]}, headers=AUTH)

    assert response.json()["tags"] == ["desert", "epic"]


def test_delete_removes_the_book(client: TestClient, make_book: MakeBook) -> None:
    book = make_book()

    assert client.delete(f"/books/{book['id']}", headers=AUTH).status_code == 204
    assert client.get(f"/books/{book['id']}").status_code == 404
    assert client.delete(f"/books/{book['id']}", headers=AUTH).status_code == 404


def test_times_are_utc(make_book: MakeBook) -> None:
    book = make_book()

    assert book["created_at"].endswith("Z") or book["created_at"].endswith("+00:00")
