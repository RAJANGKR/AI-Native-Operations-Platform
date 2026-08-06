"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReportItem } from "@/constants/mock-reports-data";

interface ReportTableProps {
  reports: ReportItem[];
}

export function ReportTable({ reports }: ReportTableProps) {
  const router = useRouter();

  const getStatusType = (status: ReportItem["status"]) => {
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
    <Card className="transition-all duration-200 hover:shadow-subtle overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Report Title</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Chapter</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-5 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {reports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => router.push(`/expense-reports/${report.id}`)}
                  className="transition-colors hover:bg-slate-50/80 group cursor-pointer"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-slate-950 flex items-center gap-1.5">
                        {report.title}
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {report.id}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-normal text-slate-600">
                    {report.event}
                  </td>
                  <td className="py-3.5 px-4 font-normal">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                      {report.chapter}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                        {report.owner.avatarInitials}
                      </div>
                      <span className="truncate max-w-[120px] text-slate-700 font-normal">
                        {report.owner.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={getStatusType(report.status)} label={report.status.toUpperCase()} />
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {report.totalAmount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-normal text-slate-600">
                    {report.expensesCount}
                  </td>
                  <td className="py-3.5 px-5 text-right font-normal text-slate-500">
                    {report.createdDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
