"""Database engine and session factory (chapter 05).

SQLAlchemy 2.0 style with SQLite. The engine and session factory are created per app in
create_app(), so tests can use their own in-memory database.
"""

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool


class Base(DeclarativeBase):
    pass


def make_engine(url: str) -> Engine:
    if url.startswith("sqlite"):
        # SQLite connections are used across FastAPI's worker threads.
        connect_args = {"check_same_thread": False}
        if url in {"sqlite://", "sqlite:///:memory:"}:
            # One shared connection, so an in-memory database survives between requests.
            return create_engine(url, connect_args=connect_args, poolclass=StaticPool)
        return create_engine(url, connect_args=connect_args)
    return create_engine(url, pool_pre_ping=True)


def make_session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, expire_on_commit=False)
