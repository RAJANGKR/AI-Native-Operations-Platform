"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RECENT_EXPENSES_DATA } from "@/constants/mock-dashboard-data";

export function ExpensesTable() {
  return (
    <Card className="transition-all duration-200 hover:shadow-subtle overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            Individual transaction logs and parsed vendor receipts.
          </CardDescription>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          View All <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-5">Merchant</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Linked Report</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {RECENT_EXPENSES_DATA.map((expense) => (
                <tr
                  key={expense.id}
                  className="transition-colors hover:bg-slate-50/80 group cursor-pointer"
                >
                  <td className="py-3 px-5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-slate-950">
                        {expense.merchant}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {expense.id}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-normal text-slate-600 truncate max-w-[200px]">
                    {expense.reportTitle}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {expense.amount}
                  </td>
                  <td className="py-3 px-5 text-right font-normal text-slate-500">
                    {expense.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
