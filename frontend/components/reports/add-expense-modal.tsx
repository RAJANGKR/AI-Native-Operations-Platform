"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, CreditCard, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCreateExpense,
  useUpdateExpense,
} from "@/hooks/use-expense-mutations";
import { toast } from "@/components/ui/toast";

const expenseFormSchema = z.object({
  merchant: z.string().min(1, "Merchant / Vendor name is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().gt(0, "Amount must be greater than 0"),
  expense_date: z.string().min(1, "Transaction date is required"),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string;
  expenseToEdit?: {
    id: string;
    merchant?: string;
    category: string;
    amount: number;
    expense_date?: string;
    notes?: string;
  } | null;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  reportId = "00000000-0000-0000-0000-000000000001",
  expenseToEdit,
}: AddExpenseModalProps) {
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      merchant: expenseToEdit?.merchant || "",
      category: expenseToEdit?.category || "travel",
      amount: expenseToEdit?.amount || 0,
      expense_date: expenseToEdit?.expense_date || new Date().toISOString().split("T")[0],
      notes: expenseToEdit?.notes || "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        merchant: expenseToEdit?.merchant || "",
        category: expenseToEdit?.category || "travel",
        amount: expenseToEdit?.amount || 0,
        expense_date: expenseToEdit?.expense_date || new Date().toISOString().split("T")[0],
        notes: expenseToEdit?.notes || "",
      });
    }
  }, [isOpen, expenseToEdit, reset]);

  if (!isOpen) return null;

  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      if (expenseToEdit) {
        await updateMutation.mutateAsync({
          expenseId: expenseToEdit.id,
          reportId,
          data: {
            merchant: values.merchant,
            category: values.category as any,
            amount: values.amount,
            expense_date: values.expense_date,
            notes: values.notes || null,
          },
        });
        toast({
          type: "success",
          title: "Expense Updated",
          description: "The line item expense was updated successfully.",
        });
      } else {
        await createMutation.mutateAsync({
          report_id: reportId,
          merchant: values.merchant,
          category: values.category as any,
          amount: values.amount,
          expense_date: values.expense_date,
          notes: values.notes || null,
        });
        toast({
          type: "success",
          title: "Expense Created",
          description: "New line item expense was added to the report.",
        });
      }
      onClose();
    } catch (err: any) {
      toast({
        type: "error",
        title: expenseToEdit ? "Failed to Update Expense" : "Failed to Create Expense",
        description: err?.response?.data?.detail || err.message || "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl z-50 space-y-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <CreditCard className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {expenseToEdit ? "Edit Expense Item" : "Add New Expense"}
              </h3>
              <p className="text-xs text-slate-500">Log line item voucher for this report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">
              Merchant / Vendor Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              disabled={isPending}
              {...register("merchant")}
              placeholder="e.g. IRCTC, Domino's, Hotel Grand"
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 focus:border-slate-400 focus:outline-none disabled:opacity-50"
            />
            {errors.merchant && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.merchant.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                disabled={isPending}
                {...register("category")}
                className="h-9 w-full rounded-lg border border-slate-200 px-2 text-slate-900 focus:border-slate-400 focus:outline-none disabled:opacity-50 cursor-pointer"
              >
                <option value="travel">Travel</option>
                <option value="food">Food</option>
                <option value="accommodation">Accommodation</option>
                <option value="printing">Printing</option>
                <option value="equipment">Equipment</option>
                <option value="software">Software</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                disabled={isPending}
                {...register("amount")}
                placeholder="0.00"
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 focus:border-slate-400 focus:outline-none disabled:opacity-50"
              />
              {errors.amount && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">
              Transaction Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              disabled={isPending}
              {...register("expense_date")}
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 focus:border-slate-400 focus:outline-none disabled:opacity-50"
            />
            {errors.expense_date && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.expense_date.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Notes / Description (Optional)</label>
            <textarea
              rows={2}
              disabled={isPending}
              {...register("notes")}
              placeholder="Voucher reference or notes..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-slate-400 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Voucher / Receipt (Multiple Support)</label>
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
              <UploadCloud className="h-5 w-5 text-slate-400 mb-1" />
              <p className="font-semibold text-slate-700 text-xs">Receipt attachment ready for upload</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Supports multiple receipts (0, 1, or 3+ attachments per expense)</p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" size="sm" type="button" disabled={isPending} onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={isPending} className="gap-1.5">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {expenseToEdit ? "Update Expense" : "Add Expense Line Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
