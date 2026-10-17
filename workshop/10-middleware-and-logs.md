# Middleware, request ids and logs

> Code that runs around every request: trace it, time it, log it.

**Time:** 15 minutes

## Goal

Know what middleware is, and make every request traceable from the client to the log.

## What middleware is

Middleware wraps every request. It runs some code before your route, calls the route, then runs
more code on the response. Good for things every request needs: ids, timing, headers, CORS.

## A request id for every request

From `app/middleware.py`:

```python
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
    access_log.info("request", extra={..., "status": response.status_code, "ms": ...})
    return response
```

- If a gateway already sent an id, we keep it, so one id follows the request across services.
- We only accept ids that look safe (letters, digits, dashes). Echoing raw header text back is a
  classic way to let someone inject content into your logs.
- `request.state` is per-request storage. The error handlers read the id from there.

## Structured logs

`JsonFormatter` writes one JSON object per line:

```text
{"level": "INFO", "logger": "shelf.access", "message": "request", "request_id": "6f1c...", "method": "GET", "path": "/books", "status": 200, "ms": 2.4}
```

Log tools (Loki, Datadog, CloudWatch) can filter on any field. Notice what is **not** logged:
bodies, query strings and headers, which can hold personal data or keys.

## CORS, if a browser calls you

A web page on another domain can only call your API if you allow it. FastAPI ships the
middleware:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-site.example"],
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["X-API-Key", "Content-Type"],
)
```

List exact origins. Avoid `"*"` for anything that takes a key.

## Check it works

```bash
curl -i http://127.0.0.1:8000/health -H "X-Request-ID: workshop-demo-1"
```

The response header echoes `workshop-demo-1`, and the server terminal shows a JSON line with the
same id.

## Exercise

Add an `X-Response-Time-Ms` header to every response, using the timing the middleware already
measures.
