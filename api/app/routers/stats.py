"""Reading stats and the activity feed (chapter 11)."""

from fastapi import APIRouter
from sqlalchemy import func, select

from app.deps import PaginationDep, SessionDep
from app.models import Activity, Book, Status
from app.schemas import ActivityRead, Page, Stats

router = APIRouter(tags=["stats"])


@router.get("/stats", response_model=Stats)
def stats(session: SessionDep) -> Stats:
    # A plain `def`: SQLAlchemy here is synchronous, so FastAPI runs this in a worker thread
    # and the event loop stays free for other requests.
    rows = session.execute(select(Book.status, func.count()).group_by(Book.status))
    counts: dict[Status, int] = {state: count for state, count in rows}
    average = session.scalar(select(func.avg(Book.rating)).where(Book.rating.is_not(None)))
    return Stats(
        total=sum(counts.values()),
        by_status={state: counts.get(state, 0) for state in Status},
        average_rating=round(float(average), 2) if average is not None else None,
    )


@router.get("/activity", response_model=Page[ActivityRead])
def activity(session: SessionDep, page: PaginationDep) -> Page[ActivityRead]:
    total = session.scalar(select(func.count()).select_from(Activity)) or 0
    rows = session.scalars(
        select(Activity)
        .order_by(Activity.created_at.desc(), Activity.id.desc())
        .limit(page.limit)
        .offset(page.offset)
    ).all()
    return Page[ActivityRead](
        items=[ActivityRead.model_validate(row) for row in rows],
        total=total,
        limit=page.limit,
        offset=page.offset,
    )
