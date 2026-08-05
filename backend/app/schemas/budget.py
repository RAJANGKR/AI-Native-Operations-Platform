from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import Field

from app.enums.budget import BudgetPeriod, BudgetStatus
from app.schemas.common import APIModel, NameStr, PositiveAmount, TimestampedResponse


class BudgetCreate(APIModel):
    """Schema for creating a budget."""

    organization_id: UUID = Field(description="Organization identifier")
    name: NameStr
    amount: PositiveAmount
    period: BudgetPeriod = Field(description="Budget time period")
    start_date: date = Field(description="Budget period start date")
    end_date: date = Field(description="Budget period end date")
    status: BudgetStatus = Field(
        default=BudgetStatus.DRAFT,
        description="Current budget lifecycle status",
    )


class BudgetUpdate(APIModel):
    """Schema for updating a budget."""

    organization_id: UUID | None = Field(
        default=None,
        description="Organization identifier",
    )
    name: NameStr | None = None
    amount: PositiveAmount | None = None
    period: BudgetPeriod | None = Field(
        default=None,
        description="Budget time period",
    )
    start_date: date | None = Field(
        default=None,
        description="Budget period start date",
    )
    end_date: date | None = Field(
        default=None,
        description="Budget period end date",
    )
    status: BudgetStatus | None = Field(
        default=None,
        description="Current budget lifecycle status",
    )


class BudgetResponse(TimestampedResponse):
    """Schema returned for budget resources."""

    organization_id: UUID = Field(description="Organization identifier")
    name: str = Field(description="Budget name")
    amount: Decimal = Field(description="Budget amount")
    period: BudgetPeriod = Field(description="Budget time period")
    start_date: date = Field(description="Budget period start date")
    end_date: date = Field(description="Budget period end date")
    status: BudgetStatus = Field(description="Current budget lifecycle status")
