"use client";

import * as React from "react";
import { Wallet, PieChart, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EventDetailData } from "@/constants/mock-events-data";
import { cn } from "@/lib/utils";

interface BudgetOverviewProps {
  event: EventDetailData;
}

export function BudgetOverview({ event }: BudgetOverviewProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-subtle">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Budget Overview & Utilization</CardTitle>
          <CardDescription>
            Real-time financial cap monitoring and allocation limits.
          </CardDescription>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            event.percentageUsed > 80
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          )}
        >
          {event.percentageUsed > 80 ? (
            <ShieldAlert className="h-3.5 w-3.5" />
          ) : null}
          {event.percentageUsed}% Spent
        </span>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Allocated Budget
            </span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {event.formattedBudget}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Approved Treasury Cap</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Current Spent
            </span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {event.formattedSpent}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Verified Vouchers</p>
          </div>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4">
            <span className="text-xs font-medium text-emerald-800 uppercase tracking-wider">
              Available Remaining
            </span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-900">
              {event.formattedRemaining}
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">Uncommitted Funds</p>
          </div>
        </div>

        {/* Large Progress Visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Budget Spent Progress</span>
            <span>{event.percentageUsed}% of {event.formattedBudget}</span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/60">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 shadow-2xs",
                event.percentageUsed > 80 ? "bg-amber-600" : "bg-slate-900"
              )}
              style={{ width: `${Math.min(event.percentageUsed, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
