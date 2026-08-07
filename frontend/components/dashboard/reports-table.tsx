"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { RECENT_REPORTS_DATA } from "@/constants/mock-dashboard-data";
import { RecentReportItem } from "@/types/dashboard";

interface ReportsTableProps {
  data?: RecentReportItem[];
}

export function ReportsTable({ data }: ReportsTableProps) {
  const reports = React.useMemo(() => {
    if (!data) return RECENT_REPORTS_DATA;
    if (data.length === 0) return [];
    return data.map((report) => ({
      id: report.id,
      title: report.title,
      member: {
        name: report.member_name || "Member",
        avatarInitials: report.member_name
          ? report.member_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : "M",
      },
      event: "General",
      status: (report.status as any) || "in-review",
      amount: `₹${Number(report.amount).toLocaleString("en-IN")}`,
      date: report.submitted_at
        ? new Date(report.submitted_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        : new Date(report.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    }));
  }, [data]);

  return (
    <Card className="transition-all duration-200 hover:shadow-subtle overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Recent Expense Reports</CardTitle>
          <CardDescription>
            Submitted reports awaiting Treasurer audit and reimbursement.
          </CardDescription>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          View All <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-5">Report Title</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-5 text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-500 font-medium">
                    No recent expense reports.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="transition-colors hover:bg-slate-50/80 group cursor-pointer"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 group-hover:text-slate-950">
                          {report.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {report.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                          {report.member.avatarInitials}
                        </div>
                        <span className="truncate max-w-[120px] text-slate-700 font-normal">
                          {report.member.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {report.amount}
                    </td>
                    <td className="py-3.5 px-5 text-right font-normal text-slate-500">
                      {report.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
