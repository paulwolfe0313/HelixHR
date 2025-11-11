from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from settings import Settings

settings = Settings()

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

@contextmanager
def get_db(tenant_id: str | None = None) -> Generator:
    """
    Yields a SQLAlchemy session and enforces the app.tenant_id parameter
    for RLS on this connection. GUCs are TEXT, so always set a string.
    """
    db = SessionLocal()
    try:
        if tenant_id:
            db.execute(text("SET app.tenant_id = :tid"), {"tid": str(tenant_id)})
        else:
            db.execute(text("SET app.tenant_id TO DEFAULT"))
        yield db
    finally:
        db.close()
