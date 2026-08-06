"use client";

import * as React from "react";
import { DollarSign, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ReportDetailData } from "@/constants/mock-reports-data";

interface TotalsCardProps {
  report: ReportDetailData;
}

export function TotalsCard({ report }: TotalsCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-subtle">
      <CardHeader className="pb-3">
        <CardTitle>Financial Summary & Totals</CardTitle>
        <CardDescription>
          Calculated line item breakdown including taxes and reimbursement value.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Expense Subtotal</span>
          <span className="font-semibold text-slate-900">{report.subtotal}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Estimated GST / Taxes</span>
          <span className="font-semibold text-slate-900">{report.tax}</span>
        </div>

        <div className="flex items-center justify-between text-sm font-bold text-slate-900 pt-3 border-t border-slate-200">
          <span>Grand Total Claim</span>
          <span className="text-lg font-extrabold text-slate-900">{report.grandTotal}</span>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Amount verified against budget limit caps for {report.event}.</span>
        </div>
      </CardContent>
    </Card>
  );
}
