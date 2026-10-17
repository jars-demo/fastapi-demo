# Running the workshop

A guide for whoever is teaching. The chapters are written so people can also follow them alone.

## Who it is for

People who can write basic Python (functions, classes, `pip install` or similar) and have used a
web API before, even just with `curl`. No FastAPI, SQL or Docker experience needed.

## Formats

| Format                     | Chapters                                                 | Time                        |
| -------------------------- | -------------------------------------------------------- | --------------------------- |
| Lightning (talk plus demo) | 01, 02, 04, 07 live on screen                            | 45 minutes                  |
| Half day                   | 01 to 09 hands-on, 10 to 12 as a demo                    | 3 to 3.5 hours with a break |
| Full day                   | All twelve, every exercise, and the final build-your-own | 6 hours                     |

## Before the day

Send this a few days ahead and ask people to run it at home:

```bash
# install uv: https://docs.astral.sh/uv/getting-started/installation/
git clone https://github.com/jars-demo/fastapi-demo.git
cd fastapi-demo/api
uv sync
uv run pytest
```

If `uv run pytest` passes, they are ready. Docker is only needed for chapter 12; people without
it can watch your screen.

Check yourself:

- [ ] `uv run uvicorn app.main:app --reload` starts and `/docs` loads.
- [ ] Your terminal and editor font are large enough for the back row.
- [ ] You have deleted `api/shelf.db`, so your demo starts with an empty shelf.
- [ ] Docker Desktop is running, if you will show chapter 12.

## Running each chapter

1. **Say the goal** (the first section of the chapter) in one sentence.
2. **Show it** in the real code, live. Open the file the chapter names.
3. **Let them do the steps.** Walk around. Most problems are a stopped server or a missing
   `X-API-Key`.
4. **Check it works together.** Ask one person to share their screen.
5. **Exercise** for the fast finishers; the rest catch up.

## The moments that land

- **Chapter 02:** open `/docs` and click **Try it out**. People did not write any docs, and there
  they are.
- **Chapter 04:** send a body with three mistakes and show three precise errors.
- **Chapter 07:** `curl -i /books/999`, then find the same request id in the server log.
- **Chapter 08:** send a write without a key, then with one, in `/docs` using **Authorize**.
- **Chapter 09:** run the whole suite. It finishes in under a second.
- **Chapter 12:** start the container without a key and read the refusal together.

## Common snags

| Symptom                                     | Fix                                                                         |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| `uv: command not found`                     | Open a new terminal after installing uv.                                    |
| 401 on every write                          | Click **Authorize** in `/docs`, or add `-H "X-API-Key: dev-key-change-me"`. |
| Changes not showing                         | The server was started without `--reload`. Restart it.                      |
| `address already in use`                    | Another server is running. Stop it, or add `--port 8001`.                   |
| Strange old data                            | Stop the server and delete `api/shelf.db`.                                  |
| Changed `.env` but nothing happened         | Settings are read at start-up. Restart the server.                          |
| Windows: `curl` behaves oddly in PowerShell | Use `curl.exe`, or the `/docs` page.                                        |

## After the workshop

Point people at the chapter 12 exercise: build their own tracker with Shelf as the template. Ask
them to share the repository link with the group.
