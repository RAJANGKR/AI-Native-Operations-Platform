"use client";

import * as React from "react";
import { Wallet, PieChart, FileClock, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { KPI_DATA, KPIItem } from "@/constants/mock-dashboard-data";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  Wallet: Wallet,
  PieChart: PieChart,
  FileClock: FileClock,
  Calendar: Calendar,
};

export function KPICard({ item }: { item: KPIItem }) {
  const Icon = ICON_MAP[item.iconName] || Wallet;

  const getTrendBadge = () => {
    if (item.trend === "up") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          <TrendingUp className="h-3 w-3" />
          {item.change}
        </span>
      );
    }
    if (item.trend === "down") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
          <FileClock className="h-3 w-3" />
          {item.change}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
        <Minus className="h-3 w-3" />
        {item.change}
      </span>
    );
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:shadow-subtle hover:border-slate-300">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {item.title}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700 shadow-2xs">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {item.value}
          </h2>
          {getTrendBadge()}
        </div>

        <p className="mt-2 text-xs text-slate-500 font-normal">
          {item.subtext}
        </p>
      </CardContent>
    </Card>
  );
}

export function KPIGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {KPI_DATA.map((item) => (
        <KPICard key={item.id} item={item} />
      ))}
    </div>
  );
}
