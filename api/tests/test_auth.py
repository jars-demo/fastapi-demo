import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr, ValidationError

from app.config import DEV_API_KEY, Settings


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("post", "/books"),
        ("patch", "/books/1"),
        ("delete", "/books/1"),
        ("post", "/books/1/finish"),
    ],
)
def test_writes_need_an_api_key(client: TestClient, method: str, path: str) -> None:
    response = client.request(method, path, json={})

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "ApiKey"
    assert response.json()["title"] == "A valid X-API-Key header is required"


def test_wrong_key_is_refused(client: TestClient) -> None:
    response = client.post(
        "/books", json={"title": "Dune", "author": "F"}, headers={"X-API-Key": "nope"}
    )

    assert response.status_code == 401


def test_reads_are_public(client: TestClient) -> None:
    assert client.get("/books").status_code == 200


def test_production_refuses_the_dev_key() -> None:
    with pytest.raises(ValidationError, match="SHELF_API_KEY"):
        Settings(environment="production", api_key=SecretStr(DEV_API_KEY))


def test_production_accepts_a_real_key() -> None:
    settings = Settings(environment="production", api_key=SecretStr("a-long-random-secret"))

    assert settings.environment == "production"
    assert "a-long-random-secret" not in repr(settings)  # SecretStr hides it
