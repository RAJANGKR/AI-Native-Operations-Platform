from fastapi import APIRouter

from app.api.routers.attachment import router as attachment_router
from app.api.routers.auth import router as auth_router
from app.api.routers.budget import router as budget_router
from app.api.routers.chapter import router as chapter_router
from app.api.routers.dashboard import router as dashboard_router
from app.api.routers.event import router as event_router
from app.api.routers.expense import router as expense_router
from app.api.routers.expense_report import router as expense_report_router
from app.api.routers.member import router as member_router
from app.api.routers.organization import router as organization_router
from app.api.routers.receipt_ocr import router as receipt_ocr_router
from app.api.v1.health import router as health_router

api_router = APIRouter(prefix="/v1")

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(attachment_router)
api_router.include_router(budget_router)
api_router.include_router(chapter_router)
api_router.include_router(dashboard_router)
api_router.include_router(event_router)
api_router.include_router(expense_router)
api_router.include_router(expense_report_router)
api_router.include_router(member_router)
api_router.include_router(organization_router)
api_router.include_router(receipt_ocr_router)
