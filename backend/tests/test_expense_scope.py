import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.enums.expense_report import ExpenseReportStatus
from app.services.expense_service import ExpenseService


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("report_organization_id", "report_member_id", "report_status", "error"),
    [
        (uuid.uuid4(), uuid.uuid4(), ExpenseReportStatus.DRAFT, "Expense report not found"),
        (None, uuid.uuid4(), ExpenseReportStatus.DRAFT, "Expense report not found"),
        (None, None, ExpenseReportStatus.SUBMITTED, "draft reports"),
    ],
)
async def test_expense_creation_rejects_unscoped_or_non_draft_report(
    report_organization_id, report_member_id, report_status, error
):
    service = ExpenseService(AsyncMock())
    member_id = uuid.uuid4()
    organization_id = uuid.uuid4()
    scoped_member_id = member_id if report_status == ExpenseReportStatus.SUBMITTED else report_member_id
    report = MagicMock(
        organization_id=report_organization_id or organization_id,
        member_id=scoped_member_id,
        status=report_status,
    )
    service.expense_report_repository.get_by_id = AsyncMock(return_value=report)
    service.expense_repository.create = AsyncMock()

    with pytest.raises((ValueError, RuntimeError), match=error):
        await service.create_expense(
            organization_id,
            member_id,
            report_id=uuid.uuid4(),
            amount=100,
        )

    service.expense_repository.create.assert_not_awaited()


@pytest.mark.asyncio
async def test_member_expense_creation_requires_report_owned_by_member():
    service = ExpenseService(AsyncMock())
    organization_id = uuid.uuid4()
    service.expense_report_repository.get_by_id = AsyncMock(
        return_value=MagicMock(
            organization_id=organization_id,
            member_id=uuid.uuid4(),
            status=ExpenseReportStatus.DRAFT,
        )
    )
    service.expense_repository.create = AsyncMock()

    with pytest.raises(ValueError, match="Expense report not found"):
        await service.create_expense(
            organization_id,
            uuid.uuid4(),
            report_id=uuid.uuid4(),
            amount=100,
        )

    service.expense_repository.create.assert_not_awaited()
