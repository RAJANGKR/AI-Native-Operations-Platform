from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel


class DashboardKPIs(APIModel):
    """Key Performance Indicators summary."""

    total_spending: Decimal = Field(
        default=Decimal("0.00"),
        description="Total spending across all expenses",
    )
    total_budget: Decimal = Field(
        default=Decimal("0.00"),
        description="Total allocated budget across all budgets",
    )
    active_events: int = Field(
        default=0,
        description="Total number of active or planned events",
    )
    pending_approvals: int = Field(
        default=0,
        description="Total number of expense reports pending approval",
    )
    total_members: int = Field(
        default=0,
        description="Total number of registered members",
    )


class MonthlySpendingItem(APIModel):
    """Monthly spending breakdown entry."""

    month: str = Field(
        ...,
        description="Month label in YYYY-MM format",
        examples=["2026-08"],
    )
    amount: Decimal = Field(
        default=Decimal("0.00"),
        description="Total expense amount for the month",
    )


class CategorySpendingItem(APIModel):
    """Category spending breakdown entry."""

    category: str = Field(
        ...,
        description="Expense category name",
        examples=["travel"],
    )
    amount: Decimal = Field(
        default=Decimal("0.00"),
        description="Total expense amount for this category",
    )
    percentage: float = Field(
        default=0.0,
        description="Percentage of total spending",
    )


class TopEventItem(APIModel):
    """Top event entry sorted by spending."""

    id: UUID = Field(description="Unique event identifier")
    name: str = Field(description="Event name")
    chapter_name: str | None = Field(
        default=None,
        description="Associated chapter name",
    )
    start_date: date | None = Field(
        default=None,
        description="Event start date",
    )
    total_spending: Decimal = Field(
        default=Decimal("0.00"),
        description="Total expenses associated with the event",
    )
    status: str = Field(description="Event status")


class RecentReportItem(APIModel):
    """Recent expense report entry."""

    id: UUID = Field(description="Unique expense report identifier")
    title: str = Field(description="Report title")
    member_name: str | None = Field(
        default=None,
        description="Member full name",
    )
    amount: Decimal = Field(
        default=Decimal("0.00"),
        description="Total amount of expenses in this report",
    )
    status: str = Field(description="Report status")
    submitted_at: datetime | None = Field(
        default=None,
        description="Submission timestamp",
    )
    created_at: datetime = Field(description="Report creation timestamp")


class RecentExpenseItem(APIModel):
    """Recent expense entry."""

    id: UUID = Field(description="Unique expense identifier")
    merchant: str | None = Field(
        default=None,
        description="Merchant or vendor name",
    )
    category: str = Field(description="Expense category")
    amount: Decimal = Field(
        default=Decimal("0.00"),
        description="Expense monetary amount",
    )
    expense_date: date = Field(description="Date when expense occurred")
    status: str = Field(description="Expense lifecycle status")


class DashboardResponse(APIModel):
    """Aggregated dashboard response payload."""

    kpis: DashboardKPIs = Field(
        default_factory=DashboardKPIs,
        description="Key Performance Indicators summary",
    )
    monthly_spending: list[MonthlySpendingItem] = Field(
        default_factory=list,
        description="Monthly spending breakdown",
    )
    spending_by_category: list[CategorySpendingItem] = Field(
        default_factory=list,
        description="Category spending breakdown",
    )
    top_events: list[TopEventItem] = Field(
        default_factory=list,
        description="Top events by spending",
    )
    recent_reports: list[RecentReportItem] = Field(
        default_factory=list,
        description="Recent expense reports",
    )
    recent_expenses: list[RecentExpenseItem] = Field(
        default_factory=list,
        description="Recent expenses",
    )
