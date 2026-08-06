"use client";

import * as React from "react";
import { FilePlus, CreditCard, BarChart3, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "outline" | "secondary";
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "new-report",
    label: "New Expense Report",
    description: "Submit multi-item batch",
    icon: FilePlus,
    variant: "default",
  },
  {
    id: "add-expense",
    label: "Add Expense",
    description: "Log transaction entry",
    icon: CreditCard,
    variant: "outline",
  },
  {
    id: "view-analytics",
    label: "View Analytics",
    description: "Treasury spend breakdown",
    icon: BarChart3,
    variant: "outline",
  },
  {
    id: "upload-receipt",
    label: "Upload Receipt",
    description: "Parse voucher document",
    icon: UploadCloud,
    variant: "secondary",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            type="button"
            className={cn(
              "group relative flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-xs transition-all duration-200 hover:scale-[1.01] hover:border-slate-300 hover:shadow-subtle active:scale-[0.99] select-none"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                  action.variant === "default"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                  {action.label}
                </p>
                <p className="text-[11px] text-slate-500 font-normal">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
