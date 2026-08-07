"use client";

import * as React from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { KPIGrid } from "@/components/dashboard/kpi-grid";
import { FinancialOverviewChart } from "@/components/dashboard/financial-overview-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { TopEventsCard } from "@/components/dashboard/top-events-card";
import { ReportsTable } from "@/components/dashboard/reports-table";
import { ExpensesTable } from "@/components/dashboard/expenses-table";
import { AIInsightsCard } from "@/components/dashboard/ai-insights-card";
import { MetricSkeleton, CardSkeleton, TableSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  return (
    <div className="space-y-8 pb-10">
      {/* Section 1: Welcome Banner */}
      <WelcomeBanner />

      {/* Section 2: Quick Actions */}
      <QuickActions />

      {/* Error State */}
      {isError && (
        <ErrorState
          title="Could not load dashboard."
          description={error?.message || "An unexpected error occurred while communicating with the backend API."}
          onRetry={() => refetch()}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-8">
          <MetricSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CardSkeleton />
            </div>
            <div className="lg:col-span-1">
              <CardSkeleton />
            </div>
          </div>
          <CardSkeleton />
          <TableSkeleton rows={5} />
          <TableSkeleton rows={5} />
        </div>
      )}

      {/* Live Data / Success State */}
      {!isLoading && !isError && (
        <>
          {/* Section 3: KPI Cards */}
          <KPIGrid data={data?.kpis} />

          {/* Section 4 & 5: Financial Overview Chart & Spending by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FinancialOverviewChart data={data?.monthly_spending} />
            </div>
            <div className="lg:col-span-1">
              <CategoryChart data={data?.spending_by_category} />
            </div>
          </div>

          {/* Section 6: Top Spending Events */}
          <TopEventsCard data={data?.top_events} />

          {/* Section 7: Recent Expense Reports */}
          <ReportsTable data={data?.recent_reports} />

          {/* Section 8: Recent Expenses */}
          <ExpensesTable data={data?.recent_expenses} />

          {/* Section 9: AI Insights Teaser */}
          <AIInsightsCard />
        </>
      )}
    </div>
  );
}
