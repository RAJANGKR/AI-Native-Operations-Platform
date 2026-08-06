from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from app.core.config import settings


def _build_async_database_url(database_url: str) -> str:
    """Return an async-compatible PostgreSQL URL for SQLAlchemy."""
    if database_url.startswith("postgresql+"):
        return database_url
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+psycopg://", 1)
    return database_url


engine: AsyncEngine = create_async_engine(
    _build_async_database_url(settings.database_url),
    echo=settings.debug,
    connect_args={"connect_timeout": 10},
)
