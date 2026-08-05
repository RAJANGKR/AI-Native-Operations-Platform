from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.enums.expense_report import ExpenseReportStatus
from app.schemas.common import APIModel, DescriptionStr, NameStr, TimestampedResponse
from app.schemas.expense import ExpenseSummaryResponse


class ExpenseReportCreate(APIModel):
    """Schema for creating an expense report."""

    organization_id: UUID = Field(description="Organization identifier")
    member_id: UUID = Field(description="Member identifier")
    title: NameStr
    description: DescriptionStr | None = Field(
        default=None,
        description="Optional report description",
        examples=["Travel expenses for the client workshop"],
    )
    status: ExpenseReportStatus = Field(
        default=ExpenseReportStatus.DRAFT,
        description="Current report lifecycle status",
    )
    submitted_at: datetime | None = Field(
        default=None,
        description="Timestamp when the report was submitted",
    )
    approved_at: datetime | None = Field(
        default=None,
        description="Timestamp when the report was approved",
    )


class ExpenseReportUpdate(APIModel):
    """Schema for updating an expense report."""

    organization_id: UUID | None = Field(
        default=None,
        description="Organization identifier",
    )
    member_id: UUID | None = Field(default=None, description="Member identifier")
    title: NameStr | None = None
    description: DescriptionStr | None = Field(
        default=None,
        description="Optional report description",
    )
    status: ExpenseReportStatus | None = Field(
        default=None,
        description="Current report lifecycle status",
    )
    submitted_at: datetime | None = Field(
        default=None,
        description="Timestamp when the report was submitted",
    )
    approved_at: datetime | None = Field(
        default=None,
        description="Timestamp when the report was approved",
    )


class ExpenseReportResponse(TimestampedResponse):
    """Schema returned for expense report resources."""

    organization_id: UUID = Field(description="Organization identifier")
    member_id: UUID = Field(description="Member identifier")
    title: str = Field(description="Expense report title")
    description: str | None = Field(
        default=None,
        description="Optional report description",
    )
    status: ExpenseReportStatus = Field(description="Current report lifecycle status")
    submitted_at: datetime | None = Field(
        default=None,
        description="Timestamp when the report was submitted",
    )
    approved_at: datetime | None = Field(
        default=None,
        description="Timestamp when the report was approved",
    )
    expenses: list[ExpenseSummaryResponse] = Field(
        default_factory=list,
        description="Expenses linked to the report",
    )
