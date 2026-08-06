"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Edit3, Trash2, Download, Calendar, Layers, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReportDetailData } from "@/constants/mock-reports-data";

interface ReportHeaderProps {
  report: ReportDetailData;
}

export function ReportHeader({ report }: ReportHeaderProps) {
  const router = useRouter();

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
          <Button variant="outline" size="sm" className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 border-rose-200">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export Audit PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
