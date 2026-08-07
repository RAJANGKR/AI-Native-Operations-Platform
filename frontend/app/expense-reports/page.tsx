"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useExpenseReports } from "@/hooks/use-expense-reports";
import { formatReportItem } from "@/types/expense-report";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ReportFilterBar } from "@/components/reports/report-filter-bar";
import { ReportTable } from "@/components/reports/report-table";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

export default function ExpenseReportsListPage() {
  const { data: rawReports, isLoading, isError, error, refetch } = useExpenseReports();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedChapter, setSelectedChapter] = React.useState("all");

  const formattedReports = React.useMemo(() => {
    if (!rawReports) return [];
    return rawReports.map(formatReportItem);
  }, [rawReports]);

  const filteredReports = React.useMemo(() => {
    return formattedReports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || report.status === selectedStatus;

      const matchesChapter =
        selectedChapter === "all" || report.chapter === selectedChapter;

      return matchesSearch && matchesStatus && matchesChapter;
    });
  }, [formattedReports, searchQuery, selectedStatus, selectedChapter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedChapter("all");
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <PageHeader
        title="Expense Reports"
        description="Manage, review and submit expense reports for Treasurer reimbursement audit."
        breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Expense Reports" }]}
        actions={
          <Link href="/expense-reports/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Report
            </Button>
          </Link>
        }
      />

      {/* Filter Bar */}
      <ReportFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedChapter={selectedChapter}
        onChapterChange={setSelectedChapter}
        onReset={handleResetFilters}
      />

      {/* Error State */}
      {isError && (
        <ErrorState
          title="Unable to load expense reports"
          description={error?.message || "Failed to fetch expense reports from server."}
          onRetry={() => refetch()}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && <TableSkeleton rows={6} />}

      {/* Reports Table or Empty State */}
      {!isLoading && !isError && (
        filteredReports.length > 0 ? (
          <ReportTable reports={filteredReports} />
        ) : (
          <EmptyState
            title="No Expense Reports Found"
            description="No expense reports match your current search query or filter selection. Create a new report to submit vouchers for reimbursement."
            action={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
                <Link href="/expense-reports/new">
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    New Report
                  </Button>
                </Link>
              </div>
            }
          />
        )
      )}
    </div>
  );
}
