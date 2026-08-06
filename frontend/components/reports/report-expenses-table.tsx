"use client";

import * as React from "react";
import { Plus, MoreHorizontal, FileCheck, FileX, FileClock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReportDetailData } from "@/constants/mock-reports-data";
import { AddExpenseModal } from "./add-expense-modal";

interface ReportExpensesTableProps {
  expenses: ReportDetailData["expenses"];
}

export function ReportExpensesTable({ expenses }: ReportExpensesTableProps) {
  const [modalOpen, setModalOpen] = React.useState(false);

  const getReceiptBadge = (status: ReportDetailData["expenses"][0]["receiptStatus"]) => {
    switch (status) {
      case "verified":
        return <StatusBadge status="approved" label="Verified" />;
      case "pending":
        return <StatusBadge status="in-review" label="OCR Pending" />;
      case "missing":
        return <StatusBadge status="rejected" label="Missing Receipt" />;
    }
  };

  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-subtle overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Itemized Expenses</CardTitle>
            <CardDescription>
              Transaction vouchers and card charges attached to this report.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" />
            Add Expense Line Item
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-5">Merchant / Vendor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Voucher File</th>
                  <th className="py-3 px-4">Receipt Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {expenses.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50/80 group cursor-pointer"
                  >
                    <td className="py-3 px-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 group-hover:text-slate-950">
                          {item.merchant}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.id} • {item.date}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 truncate max-w-[150px]">
                      {item.receiptName}
                    </td>
                    <td className="py-3 px-4">
                      {getReceiptBadge(item.receiptStatus)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {item.amount}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700 ml-auto">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddExpenseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
