# Pydantic models and validation

> Describe the shape of your data once; get checking, cleaning and docs for free.

**Time:** 20 minutes

## Goal

Write request and response models, add your own rules, and see the errors they produce.

## Request bodies

Open `app/schemas.py`. A request body is a class:

```python
class BookCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: Title
    author: Author
    status: Status = Status.WANT
    rating: Rating | None = None
    tags: Annotated[list[TagName], Field(max_length=10)] = []
```

Use it as an argument and FastAPI reads the JSON body into it:

```python
def create_book(payload: BookCreate, session: SessionDep) -> Book:
```

`extra="forbid"` refuses unknown fields, so a typo like `"tittle"` is an error instead of being
silently ignored.

## Reusable field types

Rules live in small named types, so every model uses the same ones:

```python
Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
Rating = Annotated[int, Field(ge=1, le=5, description="1 to 5 stars, only for finished books")]
TagName = Annotated[
    str, BeforeValidator(_normalise), StringConstraints(pattern=r"^[a-z0-9-]{1,30}$")
]
```

`BeforeValidator` runs first, so `"  Sci-Fi "` becomes `"sci-fi"` before the pattern is checked.

## Rules that look at several fields

A rating only makes sense for a finished book. That rule needs two fields, so it is a model
validator:

```python
@model_validator(mode="after")
def rating_only_when_done(self) -> Self:
    if self.rating is not None and self.status is not Status.DONE:
        raise ValueError("a rating can only be given to a finished (done) book")
    return self
```

## Response models

`BookRead` is what leaves the API. Routes declare it with `response_model=BookRead`, and
`from_attributes=True` lets Pydantic read a database row directly. Anything not in the model is
never sent, so internal columns cannot leak.

`Page[BookRead]` is a **generic** model: one `Page` class for books, activity, anything.

```python
class Page[ItemT: BaseModel](BaseModel):
    items: list[ItemT]
    total: int
    limit: int
    offset: int
```

## Partial updates

In `BookUpdate` every field is optional. The route uses
`payload.model_dump(exclude_unset=True)`, which contains **only the fields the client sent**.
That is the difference between "set rating to null" and "did not mention rating".

## Check it works

In `/docs`, open **POST /books**, click **Authorize** and enter `dev-key-change-me`, then send:

```json
{ "title": "", "author": "Ada", "rating": 9, "colour": "blue" }
```

You get one error per problem: `title`, `rating` and `colour`.

## Exercise

Add an optional `pages` field to `BookCreate`: a whole number from 1 to 5000. Try sending `0`
and `"many"`. (You would also need a database column to store it; that is chapter 05.)
