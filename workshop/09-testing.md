# Test it with pytest

> Fast tests against a fresh in-memory database, no server needed.

**Time:** 20 minutes

## Goal

Run the test suite, read a test, and write one of your own.

## Run the tests

```bash
cd api
uv run pytest
```

You should see every test pass in well under a second. No server is started: `TestClient` calls
the app directly.

## A fresh app for every test

`tests/conftest.py` builds the app with test settings:

```python
@pytest.fixture
def settings() -> Settings:
    return Settings(
        environment="test",
        database_url="sqlite://",          # in memory, gone after the test
        api_key=SecretStr(TEST_KEY),
        log_level="WARNING",
    )


@pytest.fixture
def client(settings: Settings) -> Iterator[TestClient]:
    # `with` runs the lifespan, which creates the tables.
    with TestClient(create_app(settings)) as test_client:
        yield test_client
```

This is the payoff from chapters 02 and 06: because the app is built by a factory and reads
everything from `app.state`, a test can hand it a different database and key.

A third fixture, `make_book`, adds a book through the real API, so tests read like stories.

## A test reads like a story

```python
def test_patch_changes_only_what_you_send(client: TestClient, make_book: MakeBook) -> None:
    book = make_book(tags=["sci-fi"])

    response = client.patch(f"/books/{book['id']}", json={"status": "reading"}, headers=AUTH)

    assert response.status_code == 200
    updated = response.json()
    assert updated["status"] == "reading"
    assert updated["title"] == book["title"]
    assert updated["tags"] == ["sci-fi"]
```

Arrange, act, assert, separated by blank lines.

## Test the unhappy paths too

The suite checks what should **fail**: missing keys, wrong keys, bad query values, invalid
bodies, a crash that must not leak its message. `pytest.mark.parametrize` runs one test for
every write route:

```python
@pytest.mark.parametrize(
    ("method", "path"),
    [("post", "/books"), ("patch", "/books/1"), ("delete", "/books/1"), ("post", "/books/1/finish")],
)
def test_writes_need_an_api_key(client: TestClient, method: str, path: str) -> None:
```

## Keep the code honest

Three more checks run in CI on every push:

```bash
uv run ruff check .           # lint
uv run ruff format --check .  # formatting
uv run mypy                   # strict type checking
```

## Check it works

```bash
uv run pytest -k auth -v
```

## Exercise

Write `test_search_is_case_insensitive`: add "Dune", then search `?q=DUNE` and expect one result.
