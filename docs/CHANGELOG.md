# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Shelf API: books with status, rating and tags; filters, search and pagination; partial updates;
  finishing a book records activity in a background task; stats and an activity feed.
- Problem-details errors with request ids, API-key auth on writes, JSON access logs, liveness
  and readiness checks.
- Settings from `SHELF_` environment variables; the dev key is refused in production.
- pytest suite with a fresh in-memory database per test; ruff and strict mypy.
- Two-stage, non-root Docker image.
- Twelve workshop chapters and a facilitator guide.
- Workshop site (Next.js) with a live request and response demo, and tests that keep the
  chapters in sync with the code.
- CI for the API, the Docker image and the site.
