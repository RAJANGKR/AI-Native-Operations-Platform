"use client";

import * as React from "react";
import { ChevronRight, CalendarCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TOP_EVENTS_DATA } from "@/constants/mock-dashboard-data";
import { cn } from "@/lib/utils";

export function TopEventsCard() {
  return (
    <Card className="transition-all duration-200 hover:shadow-subtle">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Top Spending Events</CardTitle>
          <CardDescription>
            Active event budgets and current utilization caps.
          </CardDescription>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          All Events <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {TOP_EVENTS_DATA.map((event) => (
          <div
            key={event.id}
            className="group rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 transition-all duration-150 hover:bg-slate-100/70 hover:border-slate-200 select-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-2xs">
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                    {event.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-normal">
                    {event.category}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">
                  {event.formattedAmount}
                </p>
                <p className="text-[10px] text-slate-500 font-normal">
                  Cap: {event.formattedCap}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Utilization</span>
                <span className="font-semibold text-slate-700">
                  {event.percentageUsed}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    event.percentageUsed > 80
                      ? "bg-amber-600"
                      : "bg-slate-900"
                  )}
                  style={{ width: `${event.percentageUsed}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
