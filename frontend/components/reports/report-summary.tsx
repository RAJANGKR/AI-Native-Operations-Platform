"use client";

import * as React from "react";
import { DollarSign, CreditCard, FileCheck, FileClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReportDetailData } from "@/constants/mock-reports-data";

interface ReportSummaryProps {
  report: ReportDetailData;
}

export function ReportSummary({ report }: ReportSummaryProps) {
  const cards = [
    {
      title: "Total Amount",
      value: report.grandTotal,
      subtitle: "Grand Total Value",
      icon: DollarSign,
    },
    {
      title: "Expense Count",
      value: `${report.expensesCount} Items`,
      subtitle: "Parsed Voucher Items",
      icon: CreditCard,
    },
    {
      title: "Receipts Uploaded",
      value: `${report.receiptsUploadedCount} Uploaded`,
      subtitle: "Verified Documents",
      icon: FileCheck,
    },
    {
      title: "Pending Receipts",
      value: `${report.pendingReceiptsCount} Pending`,
      subtitle: "Needs Voucher Audit",
      icon: FileClock,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="overflow-hidden shadow-xs hover:border-slate-300 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                {card.value}
              </h3>
              <p className="mt-1 text-xs text-slate-500 font-normal">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
