# Shelf API image (chapter 12). Two stages: build the virtualenv with uv, then copy only what runs.
FROM python:3.13-slim AS build
COPY --from=ghcr.io/astral-sh/uv:0.11.3 /uv /usr/local/bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev
COPY app ./app

FROM python:3.13-slim
RUN useradd --create-home --uid 10001 shelf && mkdir /data && chown shelf /data
WORKDIR /app
COPY --from=build --chown=shelf /app /app
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    SHELF_ENVIRONMENT=production \
    SHELF_DATABASE_URL=sqlite:////data/shelf.db
USER shelf
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/ready')"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
