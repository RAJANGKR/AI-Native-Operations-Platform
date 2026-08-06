"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, FileText, CreditCard, ChevronRight, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EventItem } from "@/constants/mock-events-data";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventItem;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const getStatusVariant = (status: EventItem["status"]) => {
    switch (status) {
      case "running":
        return { type: "info" as const, label: "Running" };
      case "completed":
        return { type: "approved" as const, label: "Completed" };
      case "upcoming":
        return { type: "neutral" as const, label: "Upcoming" };
      case "archived":
        return { type: "draft" as const, label: "Archived" };
      default:
        return { type: "neutral" as const, label: status };
    }
  };

  const statusConfig = getStatusVariant(event.status);

  return (
    <Link href={`/events/${event.id}`} className="block select-none">
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:shadow-subtle hover:border-slate-300 cursor-pointer flex flex-col justify-between h-full",
          className
        )}
      >
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
          {/* Header Row: Event Name, Chapter Badge & Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                <Layers className="h-3 w-3 text-slate-400" />
                {event.chapter}
              </span>
              <StatusBadge status={statusConfig.type} label={statusConfig.label} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-950 tracking-tight">
                {event.name}
              </h3>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
              {event.description}
            </p>
          </div>

          {/* Budget Metrics Row */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Budget</span>
                <p className="font-bold text-slate-900">{event.formattedBudget}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Spent</span>
                <p className="font-bold text-slate-900">{event.formattedSpent}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Remaining</span>
                <p className="font-bold text-emerald-700">{event.formattedRemaining}</p>
              </div>
            </div>

            {/* Budget Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>Spent Ratio</span>
                <span className="font-bold text-slate-700">{event.percentageUsed}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    event.percentageUsed > 80 ? "bg-amber-600" : "bg-slate-900"
                  )}
                  style={{ width: `${Math.min(event.percentageUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-normal">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3 w-3 text-slate-400" />
                {event.reportsCount} Reports
              </span>
              <span className="inline-flex items-center gap-1">
                <CreditCard className="h-3 w-3 text-slate-400" />
                {event.expensesCount} Expenses
              </span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400">
              <Calendar className="h-3 w-3" />
              {event.startDate.split(",")[0]}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
