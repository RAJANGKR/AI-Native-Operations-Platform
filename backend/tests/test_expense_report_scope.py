import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.enums.expense_report import ExpenseReportStatus
from app.services.expense_report_service import ExpenseReportService


@pytest.mark.asyncio
async def test_member_cannot_read_another_members_report_in_same_organization():
    service = ExpenseReportService(AsyncMock())
    service.expense_report_repository.get_by_id = AsyncMock(
        return_value=MagicMock(
            organization_id=uuid.uuid4(),
            member_id=uuid.uuid4(),
        )
    )

    result = await service.get_report(
        uuid.uuid4(),
        organization_id=uuid.uuid4(),
        member_id=uuid.uuid4(),
    )

    assert result is None


@pytest.mark.asyncio
@pytest.mark.parametrize("operation", ["update_report", "delete_report", "submit_report"])
async def test_member_cannot_change_another_members_report(operation):
    service = ExpenseReportService(AsyncMock())
    report = MagicMock(
        organization_id=uuid.uuid4(),
        member_id=uuid.uuid4(),
        status=ExpenseReportStatus.DRAFT,
    )
    service.expense_report_repository.get_by_id = AsyncMock(return_value=report)
    service.expense_report_repository.update = AsyncMock()
    service.expense_report_repository.delete = AsyncMock()

    with pytest.raises(ValueError, match="Expense report not found"):
        await getattr(service, operation)(
            uuid.uuid4(),
            organization_id=report.organization_id,
            member_id=uuid.uuid4(),
            **({"title": "changed"} if operation == "update_report" else {}),
        )

    service.expense_report_repository.update.assert_not_awaited()
    service.expense_report_repository.delete.assert_not_awaited()


@pytest.mark.asyncio
async def test_member_cannot_set_report_status_through_patch():
    service = ExpenseReportService(AsyncMock())
    organization_id = uuid.uuid4()
    member_id = uuid.uuid4()
    report = MagicMock(
        organization_id=organization_id,
        member_id=member_id,
        status=ExpenseReportStatus.DRAFT,
    )
    service.expense_report_repository.get_by_id = AsyncMock(return_value=report)
    service.expense_report_repository.update = AsyncMock()

    with pytest.raises(ValueError, match="submission endpoint"):
        await service.update_report(
            uuid.uuid4(), organization_id, member_id, status=ExpenseReportStatus.APPROVED
        )

    service.expense_report_repository.update.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize("operation", ["update_report", "delete_report"])
async def test_member_cannot_change_report_after_submission(operation):
    service = ExpenseReportService(AsyncMock())
    organization_id = uuid.uuid4()
    member_id = uuid.uuid4()
    report = MagicMock(
        organization_id=organization_id,
        member_id=member_id,
        status=ExpenseReportStatus.SUBMITTED,
    )
    service.expense_report_repository.get_by_id = AsyncMock(return_value=report)
    service.expense_report_repository.update = AsyncMock()
    service.expense_report_repository.delete = AsyncMock()

    with pytest.raises(RuntimeError, match="draft expense reports"):
        await getattr(service, operation)(
            uuid.uuid4(),
            organization_id,
            member_id,
            **({"title": "changed"} if operation == "update_report" else {}),
        )

    service.expense_report_repository.update.assert_not_awaited()
    service.expense_report_repository.delete.assert_not_awaited()
