from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import Field

from app.enums.expense import ExpenseCategory, ExpenseStatus
from app.schemas.attachment import AttachmentSummaryResponse
from app.schemas.common import (
    APIModel,
    DescriptionStr,
    MerchantStr,
    PositiveAmount,
    TimestampedResponse,
)


class ExpenseCreate(APIModel):
    """Schema for creating an expense."""

    report_id: UUID = Field(description="Expense report identifier")
    budget_id: UUID | None = Field(
        default=None,
        description="Optional budget identifier",
    )
    amount: PositiveAmount
    category: ExpenseCategory = Field(description="Expense category")
    expense_date: date = Field(description="Date when the expense occurred")
    merchant: MerchantStr | None = Field(
        default=None,
        description="Merchant or vendor name",
        examples=["Uber"],
    )
    notes: DescriptionStr | None = Field(
        default=None,
        description="Optional expense notes",
        examples=["Airport transfer after customer meeting"],
    )
    status: ExpenseStatus = Field(
        default=ExpenseStatus.PENDING,
        description="Current expense lifecycle status",
    )


class ExpenseUpdate(APIModel):
    """Schema for updating an expense."""

    report_id: UUID | None = Field(
        default=None,
        description="Expense report identifier",
    )
    budget_id: UUID | None = Field(
        default=None,
        description="Optional budget identifier",
    )
    amount: PositiveAmount | None = None
    category: ExpenseCategory | None = Field(
        default=None,
        description="Expense category",
    )
    expense_date: date | None = Field(
        default=None,
        description="Date when the expense occurred",
    )
    merchant: MerchantStr | None = Field(
        default=None,
        description="Merchant or vendor name",
    )
    notes: DescriptionStr | None = Field(
        default=None,
        description="Optional expense notes",
    )
    status: ExpenseStatus | None = Field(
        default=None,
        description="Current expense lifecycle status",
    )


class ExpenseSummaryResponse(TimestampedResponse):
    """Lightweight expense schema for nested responses."""

    report_id: UUID = Field(description="Expense report identifier")
    budget_id: UUID | None = Field(
        default=None,
        description="Optional budget identifier",
    )
    amount: Decimal = Field(description="Expense amount")
    category: ExpenseCategory = Field(description="Expense category")
    expense_date: date = Field(description="Date when the expense occurred")
    merchant: str | None = Field(
        default=None,
        description="Merchant or vendor name",
    )
    status: ExpenseStatus = Field(description="Current expense lifecycle status")


class ExpenseResponse(ExpenseSummaryResponse):
    """Schema returned for expense resources."""

    notes: str | None = Field(default=None, description="Optional expense notes")
    attachments: list[AttachmentSummaryResponse] = Field(
        default_factory=list,
        description="Attachments linked to the expense",
    )
