from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.api.routers.expense_report import create_report
from app.enums.role import Role
from app.schemas.expense_report import ExpenseReportCreate


def _report_response_data(organization_id, member_id, chapter_id):
    now = datetime.now(timezone.utc)
    return {
        "id": uuid4(),
        "created_at": now,
        "updated_at": now,
        "organization_id": organization_id,
        "member_id": member_id,
        "chapter_id": chapter_id,
        "event_id": None,
        "title": "Receipt test",
        "description": None,
        "status": "draft",
        "submitted_at": None,
        "approved_at": None,
        "expenses": [],
    }


@pytest.mark.asyncio
async def test_superadmin_can_create_report_for_selected_organization():
    organization_id, chapter_id, member_id = uuid4(), uuid4(), uuid4()
    service = SimpleNamespace(
        create_report=AsyncMock(
            return_value=_report_response_data(organization_id, member_id, chapter_id)
        )
    )
    payload = ExpenseReportCreate(
        organization_id=organization_id,
        member_id=uuid4(),  # The route must always bind ownership to the caller.
        chapter_id=chapter_id,
        title="Receipt test",
    )
    user = SimpleNamespace(id=member_id, organization_id=None, role=Role.SUPERADMIN)

    await create_report(payload, user, service)

    service.create_report.assert_awaited_once()
    data = service.create_report.await_args.kwargs
    assert data["organization_id"] == organization_id
    assert data["member_id"] == member_id


@pytest.mark.asyncio
async def test_non_superadmin_report_uses_callers_organization():
    own_organization_id, submitted_organization_id = uuid4(), uuid4()
    chapter_id, member_id = uuid4(), uuid4()
    service = SimpleNamespace(
        create_report=AsyncMock(
            return_value=_report_response_data(own_organization_id, member_id, chapter_id)
        )
    )
    payload = ExpenseReportCreate(
        organization_id=submitted_organization_id,
        member_id=uuid4(),  # The route must always bind ownership to the caller.
        chapter_id=chapter_id,
        title="Receipt test",
    )
    user = SimpleNamespace(
        id=member_id,
        organization_id=own_organization_id,
        role=Role.MEMBER,
    )

    await create_report(payload, user, service)

    service.create_report.assert_awaited_once()
    data = service.create_report.await_args.kwargs
    assert data["organization_id"] == own_organization_id
    assert data["member_id"] == member_id
