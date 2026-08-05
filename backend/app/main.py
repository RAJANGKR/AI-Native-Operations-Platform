from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.core.supabase import get_supabase_client
from app.exceptions.handlers import register_exception_handlers
from app.core.logging import logger

from sqlalchemy import text

from app.db.database import engine

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for the AI-Native Operations Platform",
)
logger.info("Application starting...")

register_exception_handlers(app)

app.include_router(api_router)


@app.on_event("startup")
async def startup():
    logger.info("Starting application...")

    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    logger.info("Database connection established.")

    get_supabase_client()

    logger.info("Supabase client initialized.")