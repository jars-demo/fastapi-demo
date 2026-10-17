// Site-wide content. Everything here mirrors the real API in api/app; the unit tests check that.

export const REPO_URL = 'https://github.com/jars-demo/fastapi-demo'

export type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export type Endpoint = {
  method: Method
  path: string
  does: string
  key: boolean
}

export const ENDPOINTS: Endpoint[] = [
  { method: 'GET', path: '/books', does: 'List books, with filters and pages', key: false },
  { method: 'GET', path: '/books/{book_id}', does: 'One book', key: false },
  { method: 'POST', path: '/books', does: 'Add a book', key: true },
  { method: 'PATCH', path: '/books/{book_id}', does: 'Change only what you send', key: true },
  { method: 'DELETE', path: '/books/{book_id}', does: 'Remove a book', key: true },
  { method: 'POST', path: '/books/{book_id}/finish', does: 'Mark done, rate, log it', key: true },
  { method: 'GET', path: '/stats', does: 'Counts and average rating', key: false },
  { method: 'GET', path: '/activity', does: 'What happened recently', key: false },
  { method: 'GET', path: '/ready', does: 'Can it serve traffic?', key: false },
]

export type Feature = { title: string; body: string; chapter: string }

export const FEATURES: Feature[] = [
  {
    title: 'Validation for free',
    body: 'Type hints become rules. Bad input is refused with one clear message per field.',
    chapter: '04-pydantic-models',
  },
  {
    title: 'A real database',
    body: 'SQLAlchemy 2.0 with typed models, one session per request, safe parameterised queries.',
    chapter: '05-database',
  },
  {
    title: 'Errors that help',
    body: 'Every error has the same problem+json shape and a request id. No stack traces leak.',
    chapter: '07-errors',
  },
  {
    title: 'Protected writes',
    body: 'An API key checked in constant time, and a server that refuses the dev key in production.',
    chapter: '08-auth',
  },
  {
    title: 'Tests that run in a blink',
    body: 'pytest with a fresh in-memory database per test. Lint and strict types in CI.',
    chapter: '09-testing',
  },
  {
    title: 'Ready to ship',
    body: 'Request ids, JSON logs, health checks, and a small non-root Docker image.',
    chapter: '12-ship-it',
  },
]

export type Exchange = {
  label: string
  request: string
  status: string
  response: string
}

// Real requests and (trimmed) real responses from the Shelf API.
export const EXCHANGES: Exchange[] = [
  {
    label: 'Add a book',
    request: `POST /books
X-API-Key: dev-key-change-me

{ "title": "Piranesi", "author": "Susanna Clarke", "tags": ["Fantasy"] }`,
    status: '201 Created',
    response: `{
  "id": 1,
  "title": "Piranesi",
  "author": "Susanna Clarke",
  "status": "want",
  "rating": null,
  "tags": ["fantasy"]
}`,
  },
  {
    label: 'Finish it',
    request: `POST /books/1/finish
X-API-Key: dev-key-change-me

{ "rating": 5 }`,
    status: '200 OK',
    response: `{
  "id": 1,
  "title": "Piranesi",
  "status": "done",
  "rating": 5
}`,
  },
  {
    label: 'Bad input',
    request: `POST /books
X-API-Key: dev-key-change-me

{ "title": "", "author": "Ada", "rating": 9 }`,
    status: '422 Unprocessable Content',
    response: `{
  "title": "Some fields need attention",
  "status": 422,
  "errors": [
    { "field": "title", "message": "String should have at least 1 character" },
    { "field": "rating", "message": "Input should be less than or equal to 5" }
  ]
}`,
  },
  {
    label: 'No key',
    request: `DELETE /books/1`,
    status: '401 Unauthorized',
    response: `{
  "title": "A valid X-API-Key header is required",
  "status": 401,
  "request_id": "71cbf727c8fc4819a375f7a02c271ba3"
}`,
  },
  {
    label: 'Stats',
    request: `GET /stats`,
    status: '200 OK',
    response: `{
  "total": 1,
  "by_status": { "want": 0, "reading": 0, "done": 1 },
  "average_rating": 5.0
}`,
  },
]

export const QUICKSTART = `git clone https://github.com/jars-demo/fastapi-demo.git
cd fastapi-demo/api
uv sync
uv run uvicorn app.main:app --reload
# open http://127.0.0.1:8000/docs`
