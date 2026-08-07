from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.dashboard_repository import DashboardRepository
from app.schemas.dashboard import (
    CategorySpendingItem,
    DashboardKPIs,
    DashboardResponse,
    MonthlySpendingItem,
    RecentExpenseItem,
    RecentReportItem,
    TopEventItem,
)
from app.services.base import BaseService


class DashboardService(BaseService):
    """Service layer for aggregating dashboard metrics and summaries."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.dashboard_repository = DashboardRepository(session)

    async def get_dashboard(self) -> DashboardResponse:
        """Aggregate data from dashboard repository into DashboardResponse schema."""
        # 1. KPIs
        total_spending = await self.dashboard_repository.get_total_spending()
        total_budget = await self.dashboard_repository.get_total_budget()
        active_events = await self.dashboard_repository.get_active_events_count()
        pending_approvals = await self.dashboard_repository.get_pending_approvals_count()
        total_members = await self.dashboard_repository.get_total_members_count()

        kpis = DashboardKPIs(
            total_spending=total_spending,
            total_budget=total_budget,
            active_events=active_events,
            pending_approvals=pending_approvals,
            total_members=total_members,
        )

        # 2. Monthly Spending
        raw_monthly = await self.dashboard_repository.get_monthly_spending()
        monthly_spending = [
            MonthlySpendingItem(
                month=f"{year:04d}-{month:02d}",
                amount=amount,
            )
            for year, month, amount in raw_monthly
        ]

        # 3. Category Spending
        raw_category = await self.dashboard_repository.get_category_spending()
        cat_total_sum = sum((amt for _, amt in raw_category), Decimal("0.00"))

        spending_by_category = []
        for cat_enum, amt in raw_category:
            category_str = cat_enum.value if hasattr(cat_enum, "value") else str(cat_enum)
            percentage = (
                round(float((amt / cat_total_sum) * 100), 2)
                if cat_total_sum > Decimal("0.00")
                else 0.0
            )
            spending_by_category.append(
                CategorySpendingItem(
                    category=category_str,
                    amount=amt,
                    percentage=percentage,
                )
            )

        # 4. Top Events
        raw_events = await self.dashboard_repository.get_top_events(limit=5)
        top_events = [
            TopEventItem(
                id=item["id"],
                name=item["name"],
                chapter_name=item["chapter_name"],
                start_date=item["start_date"],
                total_spending=item["total_spending"],
                status=item["status"].value if hasattr(item["status"], "value") else str(item["status"]),
            )
            for item in raw_events
        ]

        # 5. Recent Reports
        raw_reports = await self.dashboard_repository.get_recent_reports(limit=5)
        recent_reports = [
            RecentReportItem(
                id=item["id"],
                title=item["title"],
                member_name=item["member_name"],
                amount=item["total_amount"],
                status=item["status"].value if hasattr(item["status"], "value") else str(item["status"]),
                submitted_at=item["submitted_at"],
                created_at=item["created_at"],
            )
            for item in raw_reports
        ]

        # 6. Recent Expenses
        raw_expenses = await self.dashboard_repository.get_recent_expenses(limit=5)
        recent_expenses = [
            RecentExpenseItem(
                id=exp.id,
                merchant=exp.merchant,
                category=exp.category.value if hasattr(exp.category, "value") else str(exp.category),
                amount=exp.amount,
                expense_date=exp.expense_date,
                status=exp.status.value if hasattr(exp.status, "value") else str(exp.status),
            )
            for exp in raw_expenses
        ]

        return DashboardResponse(
            kpis=kpis,
            monthly_spending=monthly_spending,
            spending_by_category=spending_by_category,
            top_events=top_events,
            recent_reports=recent_reports,
            recent_expenses=recent_expenses,
        )
