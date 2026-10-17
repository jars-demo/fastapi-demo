"""Request ids and access logs (chapter 10).

Every response carries an X-Request-ID header, and every request writes one structured log line
with method, path, status and duration. Bodies are never logged.
"""

import json
import logging
import re
import time
import uuid
from collections.abc import Awaitable, Callable

from fastapi import FastAPI, Request, Response

access_log = logging.getLogger("shelf.access")

_SAFE_ID = re.compile(r"^[A-Za-z0-9-]{8,64}$")


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        line = {"level": record.levelname, "logger": record.name, "message": record.getMessage()}
        for key in ("request_id", "method", "path", "status", "ms", "error"):
            if hasattr(record, key):
                line[key] = getattr(record, key)
        return json.dumps(line)


def configure_logging(level: str) -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger("shelf")
    root.handlers[:] = [handler]
    root.setLevel(level)
    root.propagate = False


def add_request_id_middleware(app: FastAPI) -> None:
    @app.middleware("http")
    async def request_id(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        incoming = request.headers.get("X-Request-ID", "")
        # Reuse a caller's id only if it looks safe; never echo arbitrary header content.
        request.state.request_id = incoming if _SAFE_ID.match(incoming) else uuid.uuid4().hex
        started = time.perf_counter()
        response = await call_next(request)
        response.headers["X-Request-ID"] = request.state.request_id
        access_log.info(
            "request",
            extra={
                "request_id": request.state.request_id,
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "ms": round((time.perf_counter() - started) * 1000, 1),
            },
        )
        return response
