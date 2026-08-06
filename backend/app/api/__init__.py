from fastapi import APIRouter

from app.api.routers import (
    attachment_router,
    budget_router,
    chapter_router,
    event_router,
    expense_report_router,
    expense_router,
    member_router,
    organization_router,
)
from app.api.v1.health import router as health_router

api_router = APIRouter(prefix="/api/v1", tags=["API"])

api_router.include_router(health_router)
api_router.include_router(organization_router)
api_router.include_router(chapter_router)
api_router.include_router(event_router)
api_router.include_router(member_router)
api_router.include_router(budget_router)
api_router.include_router(expense_report_router)
api_router.include_router(expense_router)
api_router.include_router(attachment_router)
