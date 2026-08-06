import * as React from "react";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { KPIGrid } from "@/components/dashboard/kpi-grid";
import { FinancialOverviewChart } from "@/components/dashboard/financial-overview-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { TopEventsCard } from "@/components/dashboard/top-events-card";
import { ReportsTable } from "@/components/dashboard/reports-table";
import { ExpensesTable } from "@/components/dashboard/expenses-table";
import { AIInsightsCard } from "@/components/dashboard/ai-insights-card";

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Section 1: Welcome Banner */}
      <WelcomeBanner />

      {/* Section 2: Quick Actions */}
      <QuickActions />

      {/* Section 3: KPI Cards */}
      <KPIGrid />

      {/* Section 4 & 5: Financial Overview Chart & Spending by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FinancialOverviewChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryChart />
        </div>
      </div>

      {/* Section 6: Top Spending Events */}
      <TopEventsCard />

      {/* Section 7: Recent Expense Reports */}
      <ReportsTable />

      {/* Section 8: Recent Expenses */}
      <ExpensesTable />

      {/* Section 9: AI Insights Teaser */}
      <AIInsightsCard />
    </div>
  );
}
