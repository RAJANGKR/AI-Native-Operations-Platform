from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import logger
from app.core.supabase import get_supabase_client
from app.db.database import engine
from app.exceptions.handlers import register_exception_handlers

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for the AI-Native Operations Platform",
)
logger.info("Application starting...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(api_router, prefix="/api")


@app.on_event("startup")
async def startup():
    logger.info("Starting application...")

    async with engine.connect() as connection:
        await connection.execute(text("SELECT 1"))

    logger.info("Database connection established.")

    get_supabase_client()

    logger.info("Supabase client initialized.")
