import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/services/expense";
import { ExpenseDetail, ExpenseCreate, ExpenseUpdate } from "@/types/expense";

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation<ExpenseDetail, Error, ExpenseCreate>({
    mutationFn: (data) => createExpense(data),
    onSuccess: (newExpense) => {
      queryClient.invalidateQueries({ queryKey: ["expense-reports"] });
      queryClient.invalidateQueries({
        queryKey: ["expense-report", newExpense.report_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses", newExpense.report_id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation<
    ExpenseDetail,
    Error,
    { expenseId: string; reportId: string; data: ExpenseUpdate }
  >({
    mutationFn: ({ expenseId, data }) => updateExpense(expenseId, data),
    onSuccess: (updatedExpense, variables) => {
      const rId = updatedExpense.report_id || variables.reportId;
      queryClient.invalidateQueries({ queryKey: ["expense-reports"] });
      queryClient.invalidateQueries({ queryKey: ["expense-report", rId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", rId] });
      queryClient.invalidateQueries({
        queryKey: ["expense", variables.expenseId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { expenseId: string; reportId: string }
  >({
    mutationFn: ({ expenseId }) => deleteExpense(expenseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expense-reports"] });
      queryClient.invalidateQueries({
        queryKey: ["expense-report", variables.reportId],
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.reportId],
      });
      queryClient.invalidateQueries({
        queryKey: ["expense", variables.expenseId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
