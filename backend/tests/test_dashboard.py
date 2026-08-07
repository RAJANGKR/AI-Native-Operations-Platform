import pytest
from fastapi import status
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.schemas.dashboard import DashboardResponse


@pytest.mark.asyncio
async def test_dashboard_endpoint_schema():
    """Verify GET /api/v1/dashboard OpenAPI endpoint structure."""
    openapi = app.openapi()
    assert "/api/v1/dashboard" in openapi["paths"]
    path_item = openapi["paths"]["/api/v1/dashboard"]
    assert "get" in path_item


@pytest.mark.asyncio
async def test_dashboard_response_model():
    """Verify DashboardResponse model initialization with defaults."""
    response_model = DashboardResponse()
    assert response_model.kpis.total_spending == 0
    assert response_model.kpis.total_budget == 0
    assert response_model.kpis.active_events == 0
    assert response_model.kpis.pending_approvals == 0
    assert response_model.kpis.total_members == 0
    assert response_model.monthly_spending == []
    assert response_model.spending_by_category == []
    assert response_model.top_events == []
    assert response_model.recent_reports == []
    assert response_model.recent_expenses == []
