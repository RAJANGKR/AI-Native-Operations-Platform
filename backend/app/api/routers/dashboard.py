import uuid

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_dashboard_service,
    get_scope_organization_id,
    translate_service_exception,
)
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get aggregated dashboard data",
    description="Fetch key performance indicators, spending summaries, top events, recent reports, and recent expenses for the caller's organization.",
)
async def get_dashboard(
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: DashboardService = Depends(get_dashboard_service),
) -> DashboardResponse:
    try:
        return await service.get_dashboard(scope_organization_id)
    except Exception as exc:
        return translate_service_exception(exc)
