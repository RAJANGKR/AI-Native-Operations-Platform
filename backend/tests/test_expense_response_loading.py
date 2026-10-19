from datetime import date, datetime, timezone
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.enums.expense import ExpenseCategory, ExpenseStatus
from app.enums.expense_report import ExpenseReportStatus
from app.repositories.expense_repository import ExpenseRepository
from app.schemas.expense import ExpenseResponse
from app.services.expense_service import ExpenseService


@pytest.mark.asyncio
async def test_expense_repository_eager_loads_attachments_for_detail_query():
    result = SimpleNamespace(scalar_one_or_none=lambda: None)
    session = SimpleNamespace(execute=AsyncMock(return_value=result))
    repository = ExpenseRepository(session)

    await repository.get_by_id(uuid4())

    statement = session.execute.await_args.args[0]
    assert statement._with_options  # selectinload(Expense.attachments)


@pytest.mark.asyncio
async def test_created_expense_is_reloaded_with_attachments_before_commit():
    report_id, organization_id, member_id = uuid4(), uuid4(), uuid4()
    expense_id = uuid4()
    now = datetime.now(timezone.utc)
    loaded_expense = SimpleNamespace(
        id=expense_id,
        created_at=now,
        updated_at=now,
        report_id=report_id,
        budget_id=None,
        amount=Decimal("4050.00"),
        category=ExpenseCategory.OTHER,
        expense_date=date(2026, 10, 10),
        merchant="Test merchant",
        status=ExpenseStatus.PENDING,
        notes=None,
        attachments=[],
    )
    session = AsyncMock()
    service = ExpenseService(session)
    service.expense_report_repository.get_by_id = AsyncMock(
        return_value=SimpleNamespace(
            organization_id=organization_id,
            member_id=member_id,
            status=ExpenseReportStatus.DRAFT,
        )
    )
    service.expense_repository.create = AsyncMock(
        return_value=SimpleNamespace(id=expense_id)
    )
    service.expense_repository.get_by_id = AsyncMock(return_value=loaded_expense)

    expense = await service.create_expense(
        organization_id,
        member_id,
        report_id=report_id,
        amount=Decimal("4050.00"),
        category=ExpenseCategory.OTHER,
        expense_date=date(2026, 10, 10),
        merchant="Test merchant",
        status=ExpenseStatus.PENDING,
    )

    service.expense_repository.create.assert_awaited_once()
    service.expense_repository.get_by_id.assert_awaited_once_with(expense_id)
    session.commit.assert_awaited_once()
    assert ExpenseResponse.model_validate(expense).attachments == []
