"use client";

import * as React from "react";
import { Wallet, PieChart, CheckCircle2, FileText, CreditCard, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EventDetailData } from "@/constants/mock-events-data";

interface EventSummaryKPIsProps {
  event: EventDetailData;
}

export function EventSummaryKPIs({ event }: EventSummaryKPIsProps) {
  const kpiItems = [
    {
      label: "Total Budget",
      value: event.formattedBudget,
      icon: Wallet,
      subtitle: "Allocated Cap",
    },
    {
      label: "Total Spent",
      value: event.formattedSpent,
      icon: PieChart,
      subtitle: `${event.percentageUsed}% Utilized`,
    },
    {
      label: "Remaining",
      value: event.formattedRemaining,
      icon: CheckCircle2,
      subtitle: "Available Balance",
    },
    {
      label: "Expense Reports",
      value: `${event.reportsCount} Reports`,
      icon: FileText,
      subtitle: "Submitted Batches",
    },
    {
      label: "Total Expenses",
      value: `${event.expensesCount} Items`,
      icon: CreditCard,
      subtitle: "Parsed Vouchers",
    },
    {
      label: "Team Members",
      value: `${event.membersCount} Members`,
      icon: Users,
      subtitle: "Authorized Leads",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpiItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="overflow-hidden shadow-xs hover:border-slate-300 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {item.label}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="mt-2 text-lg font-bold tracking-tight text-slate-900 truncate">
                {item.value}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500 font-medium truncate">
                {item.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
