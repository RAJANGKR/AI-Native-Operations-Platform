"use client";

import * as React from "react";
import { useExpenseReport } from "@/hooks/use-expense-reports";
import { ReportForm } from "@/components/reports/report-form";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

interface EditReportPageProps {
  params: Promise<{
    reportId: string;
  }>;
}

export default function EditReportPage({ params }: EditReportPageProps) {
  const { reportId } = React.use(params);
  const { data: report, isLoading, isError, error, refetch } = useExpenseReport(reportId);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <ErrorState
          title="Could not load report for editing"
          description={error?.message || "Expense report not found."}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <ReportForm
      mode="edit"
      initialValues={{
        id: report.id,
        title: report.title,
        chapter: report.chapter || "AI Chapter",
        event: report.event || "RTMASS 2026",
        description: report.description || "",
      }}
    />
  );
}
