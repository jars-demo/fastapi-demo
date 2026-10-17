"""The app factory: one place that wires everything together.

Run it with:  uv run uvicorn app.main:app --reload
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import Settings, get_settings
from app.db import Base, make_engine, make_session_factory
from app.errors import register_error_handlers
from app.middleware import add_request_id_middleware, configure_logging
from app.routers import books, health, stats

DESCRIPTION = """
**Shelf** keeps your reading list: books you want to read, are reading, and have finished.

Reads are open. Writes need an `X-API-Key` header (the dev key is `dev-key-change-me`).
"""


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)

    engine = make_engine(settings.database_url)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        Base.metadata.create_all(engine)  # fine for a workshop; use migrations in real apps
        yield
        engine.dispose()

    app = FastAPI(
        title="Shelf",
        version="0.1.0",
        summary="A small, production-shaped reading-list API.",
        description=DESCRIPTION,
        lifespan=lifespan,
    )
    app.state.settings = settings
    app.state.session_factory = make_session_factory(engine)

    register_error_handlers(app)
    add_request_id_middleware(app)

    app.include_router(health.router)
    app.include_router(books.router)
    app.include_router(stats.router)
    return app


app = create_app()
