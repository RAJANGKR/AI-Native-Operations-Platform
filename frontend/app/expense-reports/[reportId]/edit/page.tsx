import * as React from "react";
import { notFound } from "next/navigation";
import { getReportDetails } from "@/constants/mock-reports-data";
import { ReportForm } from "@/components/reports/report-form";

interface EditReportPageProps {
  params: Promise<{
    reportId: string;
  }>;
}

export default async function EditReportPage({ params }: EditReportPageProps) {
  const { reportId } = await params;
  const report = getReportDetails(reportId);

  if (!report) {
    notFound();
  }

  return (
    <ReportForm
      mode="edit"
      initialValues={{
        id: report.id,
        title: report.title,
        chapter: report.chapter,
        event: report.event,
        description: report.description,
      }}
    />
  );
}
