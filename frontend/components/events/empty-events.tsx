"use client";

import * as React from "react";
import { CalendarX, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyEventsProps {
  onResetFilters?: () => void;
}

export function EmptyEvents({ onResetFilters }: EmptyEventsProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-400 mb-4">
        <CalendarX className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 tracking-tight">No Events Found</h3>
      <p className="mt-1.5 text-xs text-slate-500 max-w-md leading-relaxed">
        No events match your current filter selection or search query. Create a new event or adjust your search filters to view event budgets.
      </p>
      <div className="mt-6 flex items-center gap-3">
        {onResetFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Clear Filters
          </Button>
        )}
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create First Event
        </Button>
      </div>
    </div>
  );
}
