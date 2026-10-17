"""Errors that help (chapter 07).

Every error, expected or not, becomes the same problem+json shape, carries the request id, and
never leaks a stack trace or database detail to the client.
"""

import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.schemas import Problem

log = logging.getLogger("shelf")


class NotFoundError(Exception):
    def __init__(self, resource: str, identifier: object) -> None:
        super().__init__(f"{resource} {identifier} not found")
        self.resource = resource
        self.identifier = identifier


def problem(
    request: Request,
    status: int,
    title: str,
    detail: str | None = None,
    errors: list[dict[str, Any]] | None = None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    body = Problem(
        title=title,
        status=status,
        detail=detail,
        request_id=getattr(request.state, "request_id", None),
        errors=errors,
    )
    return JSONResponse(
        body.model_dump(exclude_none=True),
        status_code=status,
        media_type="application/problem+json",
        headers=headers,
    )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(NotFoundError)
    async def not_found(request: Request, exc: NotFoundError) -> JSONResponse:
        return problem(request, 404, f"{exc.resource.capitalize()} not found", str(exc))

    @app.exception_handler(RequestValidationError)
    async def invalid(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = [
            {
                "field": ".".join(str(part) for part in err["loc"][1:]) or "body",
                "message": err["msg"],
            }
            for err in exc.errors()
        ]
        return problem(request, 422, "Some fields need attention", errors=errors)

    @app.exception_handler(StarletteHTTPException)
    async def http_error(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        title = exc.detail if isinstance(exc.detail, str) else "Request failed"
        return problem(request, exc.status_code, title, headers=getattr(exc, "headers", None))

    @app.exception_handler(Exception)
    async def unexpected(request: Request, exc: Exception) -> JSONResponse:
        # Log the type only: messages can contain user data. The request id links log and reply.
        log.error(
            "unhandled error",
            extra={
                "error": type(exc).__name__,
                "request_id": getattr(request.state, "request_id", None),
            },
        )
        return problem(request, 500, "Something went wrong on our side")
