"use client";

import * as React from "react";
import { useExpenseReport } from "@/hooks/use-expense-reports";
import { formatReportDetailData } from "@/types/expense-report";
import { ReportHeader } from "@/components/reports/report-header";
import { ReportSummary } from "@/components/reports/report-summary";
import { ReportExpensesTable } from "@/components/reports/report-expenses-table";
import { AttachmentGrid } from "@/components/reports/attachment-grid";
import { TotalsCard } from "@/components/reports/totals-card";
import { ActivityTimeline } from "@/components/reports/activity-timeline";
import { SubmitCard } from "@/components/reports/submit-card";
import { CardSkeleton, TableSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

interface ReportDetailPageProps {
  params: Promise<{
    reportId: string;
  }>;
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { reportId } = React.use(params);
  const { data: rawReport, isLoading, isError, error, refetch } = useExpenseReport(reportId);

  const report = React.useMemo(() => {
    if (!rawReport) return null;
    return formatReportDetailData(rawReport);
  }, [rawReport]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-10">
        <CardSkeleton />
        <CardSkeleton />
        <TableSkeleton rows={4} />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="py-12">
        <ErrorState
          title="Could not load expense report"
          description={error?.message || "The requested expense report could not be found or loaded from the backend server."}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Hero Header */}
      <ReportHeader report={report} />

      {/* 2. Summary Cards */}
      <ReportSummary report={report} />

      {/* 3. Expenses Table */}
      <ReportExpensesTable expenses={report.expenses} reportId={report.id} />

      {/* 4. Attachments */}
      <AttachmentGrid
        attachments={report.attachments}
        reportId={report.id}
        expenseId={report.expenses[0]?.id || "00000000-0000-0000-0000-000000000005"}
      />

      {/* 5 & 6. Totals Card & Activity Timeline Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TotalsCard report={report} />
        </div>
        <div className="lg:col-span-2">
          <ActivityTimeline activities={report.activityTimeline} />
        </div>
      </div>

      {/* 7. Submit Section */}
      <SubmitCard report={report} />
    </div>
  );
}
