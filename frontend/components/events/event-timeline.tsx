"use client";

import * as React from "react";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EventTimelineItem } from "@/constants/mock-events-data";
import { cn } from "@/lib/utils";

interface EventTimelineProps {
  timeline: EventTimelineItem[];
}

export function EventTimeline({ timeline }: EventTimelineProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-subtle">
      <CardHeader className="pb-3">
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>
          Chronological log of event expense submissions and audit approvals.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {timeline.map((item) => (
            <div key={item.id} className="relative flex flex-col gap-1 text-xs select-none">
              {/* Point Indicator */}
              <div
                className={cn(
                  "absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white border ring-4 ring-white",
                  item.status === "verified"
                    ? "border-emerald-500 text-emerald-600"
                    : item.status === "flagged"
                    ? "border-rose-500 text-rose-600"
                    : "border-amber-500 text-amber-600"
                )}
              >
                {item.status === "verified" ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    {item.amount}
                  </span>
                  <span className="text-[11px] font-normal text-slate-400 font-mono">
                    {item.date}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
