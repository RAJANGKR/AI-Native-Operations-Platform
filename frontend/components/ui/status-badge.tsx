import * as React from "react";
import { cn } from "@/lib/utils";
import { StatusType } from "@/types";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  label?: string;
  dot?: boolean;
}

const statusConfig: Record<
  StatusType,
  { bg: string; text: string; border: string; dotBg: string; defaultLabel: string }
> = {
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/60",
    dotBg: "bg-emerald-500",
    defaultLabel: "Completed",
  },
  approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/60",
    dotBg: "bg-emerald-500",
    defaultLabel: "Approved",
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/60",
    dotBg: "bg-amber-500",
    defaultLabel: "Warning",
  },
  "in-review": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/60",
    dotBg: "bg-amber-500",
    defaultLabel: "In Review",
  },
  danger: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/60",
    dotBg: "bg-rose-500",
    defaultLabel: "Critical",
  },
  rejected: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/60",
    dotBg: "bg-rose-500",
    defaultLabel: "Rejected",
  },
  info: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200/60",
    dotBg: "bg-sky-500",
    defaultLabel: "Processing",
  },
  neutral: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dotBg: "bg-slate-400",
    defaultLabel: "Active",
  },
  draft: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    dotBg: "bg-slate-400",
    defaultLabel: "Draft",
  },
};

export function StatusBadge({
  status,
  label,
  dot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.neutral;
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
        config.bg,
        config.text,
        config.border,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", config.dotBg)}
          aria-hidden="true"
        />
      )}
      {displayLabel}
    </span>
  );
}
