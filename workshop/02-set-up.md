# Set up and run it

> Install uv, start the server, and explore the live docs at /docs.

**Time:** 10 minutes

## Goal

Shelf running on your machine, and the interactive docs open in your browser.

## Steps

1. **Install uv.** It manages Python and packages for you, and it is fast.

   ```bash
   # macOS and Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh
   # Windows (PowerShell)
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

2. **Get the code and install everything.** uv reads `.python-version` and installs Python 3.13
   if you do not have it, then installs the exact versions in `uv.lock`.

   ```bash
   git clone https://github.com/jars-demo/fastapi-demo.git
   cd fastapi-demo/api
   uv sync
   ```

3. **Start the server.** `--reload` restarts it every time you save a file.

   ```bash
   uv run uvicorn app.main:app --reload
   ```

   You should see `Uvicorn running on http://127.0.0.1:8000`.

4. **Open the docs.** Visit <http://127.0.0.1:8000/docs>. Every route is listed. Click
   **GET /health**, then **Try it out**, then **Execute**.

## How the app starts

Open `app/main.py`. The important part is short:

```python
def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    ...
    app.include_router(health.router)
    app.include_router(books.router)
    app.include_router(stats.router)
    return app


app = create_app()
```

A **factory function** builds the app. Uvicorn imports `app.main:app` (the module `app.main`,
the variable `app`). Tests call `create_app()` themselves with test settings. That one idea makes
the whole project easy to test.

## Check it works

```bash
curl http://127.0.0.1:8000/health
# {"status":"ok"}
```

Also open <http://127.0.0.1:8000/redoc> for a second, read-only style of docs, and
<http://127.0.0.1:8000/openapi.json> for the raw description both are built from.

## Exercise

Change the `summary` in `create_app()` to your own sentence, save, and refresh `/docs`. The
server reloaded by itself.
