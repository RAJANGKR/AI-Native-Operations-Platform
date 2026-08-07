from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_dashboard_service, translate_service_exception
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get aggregated dashboard data",
    description="Fetch key performance indicators, spending summaries, top events, recent reports, and recent expenses.",
)
async def get_dashboard(
    service: DashboardService = Depends(get_dashboard_service),
) -> DashboardResponse:
    try:
        return await service.get_dashboard()
    except Exception as exc:
        translate_service_exception(exc)
