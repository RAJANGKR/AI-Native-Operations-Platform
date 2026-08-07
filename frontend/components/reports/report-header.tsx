"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Edit3, Trash2, Download, Calendar, Layers, Tag, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReportDetailData } from "@/constants/mock-reports-data";
import { useDeleteExpenseReport } from "@/hooks/use-expense-report-mutations";
import { toast } from "@/components/ui/toast";

interface ReportHeaderProps {
  report: ReportDetailData;
}

export function ReportHeader({ report }: ReportHeaderProps) {
  const router = useRouter();
  const deleteMutation = useDeleteExpenseReport();
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(report.id);
      toast({
        type: "success",
        title: "Report Deleted",
        description: `Expense report ${report.id} was deleted successfully.`,
      });
      router.push("/expense-reports");
    } catch (err: any) {
      toast({
        type: "error",
        title: "Failed to Delete Report",
        description: err?.response?.data?.detail || err.message || "Could not delete report.",
      });
    }
  };

  const getStatusType = (status: ReportDetailData["status"]) => {
    switch (status) {
      case "approved":
        return "approved" as const;
      case "submitted":
      case "pending":
        return "in-review" as const;
      case "rejected":
        return "rejected" as const;
      case "draft":
      default:
        return "draft" as const;
    }
  };

  return (
    <div className="space-y-4 pb-6 border-b border-slate-200/80">
      {/* Breadcrumb Navigation */}
      <Link
        href="/expense-reports"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Expense Reports
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title, Owner, Event, Chapter, Status */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
              <Layers className="h-3.5 w-3.5 text-emerald-400" />
              {report.chapter}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              {report.event}
            </span>
            <StatusBadge status={getStatusType(report.status)} label={report.status.toUpperCase()} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {report.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">
                {report.owner.avatarInitials}
              </div>
              <span className="font-semibold text-slate-800">{report.owner.name}</span>
              <span>({report.owner.role})</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Created {report.createdDate}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/expense-reports/${report.id}/edit`)}
            className="gap-1.5 text-xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmDelete(true)}
            disabled={deleteMutation.isPending}
            className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export Audit PDF
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Delete Expense Report</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{report.title}"</span> ({report.id})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
              >
                {deleteMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
