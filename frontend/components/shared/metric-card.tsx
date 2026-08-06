import * as React from "react";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  trend = "neutral",
  subtitle,
  icon: Icon,
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />;
    if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-rose-600" />;
    return <Minus className="h-3.5 w-3.5 text-slate-400" />;
  };

  const getTrendClass = () => {
    if (trend === "up") return "text-emerald-700 bg-emerald-50 border-emerald-200/60";
    if (trend === "down") return "text-rose-700 bg-rose-50 border-rose-200/60";
    return "text-slate-600 bg-slate-100 border-slate-200";
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100/80 text-slate-600 border border-slate-200/60">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
          {change && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium select-none",
                getTrendClass()
              )}
            >
              {getTrendIcon()}
              {change}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-2 text-xs text-slate-500 font-normal">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
