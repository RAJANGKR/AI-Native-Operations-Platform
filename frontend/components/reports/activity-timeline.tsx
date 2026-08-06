"use client";

import * as React from "react";
import { Clock, PlusCircle, Upload, Edit3, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ReportActivityItem } from "@/constants/mock-reports-data";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  activities: ReportActivityItem[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getActivityIcon = (type: ReportActivityItem["type"]) => {
    switch (type) {
      case "expense_added":
        return <PlusCircle className="h-3.5 w-3.5 text-blue-600" />;
      case "receipt_uploaded":
        return <Upload className="h-3.5 w-3.5 text-emerald-600" />;
      case "report_edited":
        return <Edit3 className="h-3.5 w-3.5 text-amber-600" />;
      case "report_submitted":
        return <Send className="h-3.5 w-3.5 text-slate-900" />;
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-subtle">
      <CardHeader className="pb-3">
        <CardTitle>Report Audit Activity</CardTitle>
        <CardDescription>
          Chronological edit log and submission timeline.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {activities.map((item) => (
            <div key={item.id} className="relative flex flex-col gap-0.5 text-xs select-none">
              <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-300 ring-4 ring-white">
                {getActivityIcon(item.type)}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{item.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
              </div>

              <p className="text-[11px] text-slate-500 font-normal">
                Action by <strong className="font-semibold text-slate-700">{item.actor}</strong>
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
