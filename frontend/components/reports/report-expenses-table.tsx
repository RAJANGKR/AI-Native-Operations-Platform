"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, Loader2, Paperclip } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReportDetailData } from "@/constants/mock-reports-data";
import { AddExpenseModal } from "./add-expense-modal";
import { useDeleteExpense } from "@/hooks/use-expense-mutations";
import { toast } from "@/components/ui/toast";

interface ReportExpensesTableProps {
  expenses: ReportDetailData["expenses"];
  reportId?: string;
}

export function ReportExpensesTable({ expenses, reportId = "00000000-0000-0000-0000-000000000001" }: ReportExpensesTableProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<any | null>(null);

  const deleteExpenseMutation = useDeleteExpense();

  const handleEdit = (item: any) => {
    setEditingExpense({
      id: item.id,
      merchant: item.merchant,
      category: item.category,
      amount: item.numericAmount || (typeof item.amount === "number" ? item.amount : parseFloat(String(item.amount).replace(/[^0-9.]/g, "")) || 0),
      expense_date: item.date,
      notes: "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (expenseId: string) => {
    try {
      await deleteExpenseMutation.mutateAsync({ expenseId, reportId });
      toast({
        type: "success",
        title: "Expense Deleted",
        description: "The line item expense was deleted successfully.",
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Failed to Delete Expense",
        description: err?.response?.data?.detail || err.message || "Could not delete expense item.",
      });
    }
  };

  const getReceiptBadge = (item: any) => {
    const attachmentCount = item.attachmentsCount ?? (item.receiptName ? 1 : 0);

    if (attachmentCount === 0) {
      return <StatusBadge status="rejected" label="0 Receipts" />;
    }

    if (attachmentCount === 1) {
      return <StatusBadge status="approved" label="1 Receipt" />;
    }

    return <StatusBadge status="approved" label={`${attachmentCount} Receipts`} />;
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
          <Button
            size="sm"
            onClick={() => {
              setEditingExpense(null);
              setModalOpen(true);
            }}
            className="gap-1.5 text-xs"
          >
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
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-normal">
                      No expense line items added to this report yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-slate-50/80 group"
                    >
                      <td className="py-3 px-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
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
                        <div className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{item.receiptName || "voucher_receipt.pdf"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getReceiptBadge(item)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {item.amount}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(item)}
                            title="Edit Expense"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteExpenseMutation.isPending}
                            title="Delete Expense"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                          >
                            {deleteExpenseMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddExpenseModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingExpense(null);
        }}
        reportId={reportId}
        expenseToEdit={editingExpense}
      />
    </>
  );
}
