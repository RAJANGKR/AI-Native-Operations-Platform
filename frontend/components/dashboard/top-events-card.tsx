"use client";

import * as React from "react";
import { ChevronRight, CalendarCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TOP_EVENTS_DATA } from "@/constants/mock-dashboard-data";
import { TopEventItem } from "@/types/dashboard";

interface TopEventsCardProps {
  data?: TopEventItem[];
}

export function TopEventsCard({ data }: TopEventsCardProps) {
  const events = React.useMemo(() => {
    if (!data) return TOP_EVENTS_DATA;
    if (data.length === 0) return [];
    return data.map((event) => ({
      id: event.id,
      name: event.name,
      category: event.chapter_name || event.status || "Event",
      formattedAmount: `₹${Number(event.total_spending).toLocaleString("en-IN")}`,
      formattedCap: "N/A",
      percentageUsed: 0,
    }));
  }, [data]);

  return (
    <Card className="transition-all duration-200 hover:shadow-subtle">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Top Spending Events</CardTitle>
          <CardDescription>
            Active event budgets and expense totals.
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
        {events.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            No events found.
          </div>
        ) : (
          events.map((event) => (
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
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
