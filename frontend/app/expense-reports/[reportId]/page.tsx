import * as React from "react";
import { notFound } from "next/navigation";
import { getReportDetails } from "@/constants/mock-reports-data";
import { ReportHeader } from "@/components/reports/report-header";
import { ReportSummary } from "@/components/reports/report-summary";
import { ReportExpensesTable } from "@/components/reports/report-expenses-table";
import { AttachmentGrid } from "@/components/reports/attachment-grid";
import { TotalsCard } from "@/components/reports/totals-card";
import { ActivityTimeline } from "@/components/reports/activity-timeline";
import { SubmitCard } from "@/components/reports/submit-card";

interface ReportDetailPageProps {
  params: Promise<{
    reportId: string;
  }>;
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { reportId } = await params;
  const report = getReportDetails(reportId);

  if (!report) {
    notFound();
  }

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Hero Header */}
      <ReportHeader report={report} />

      {/* 2. Summary Cards */}
      <ReportSummary report={report} />

      {/* 3. Expenses Table */}
      <ReportExpensesTable expenses={report.expenses} />

      {/* 4. Attachments */}
      <AttachmentGrid attachments={report.attachments} />

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
