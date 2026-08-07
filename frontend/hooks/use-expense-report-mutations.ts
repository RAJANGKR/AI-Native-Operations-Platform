import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExpenseReport,
  updateExpenseReport,
  deleteExpenseReport,
  submitExpenseReport,
} from "@/services/expense-report";
import { ExpenseReportSummary } from "@/types/expense-report";

export function useCreateExpenseReport() {
  const queryClient = useQueryClient();
  return useMutation<ExpenseReportSummary, Error, any>({
    mutationFn: (data) => createExpenseReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateExpenseReport() {
  const queryClient = useQueryClient();
  return useMutation<
    ExpenseReportSummary,
    Error,
    { reportId: string; data: any }
  >({
    mutationFn: ({ reportId, data }) => updateExpenseReport(reportId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expense-reports"] });
      queryClient.invalidateQueries({
        queryKey: ["expense-report", variables.reportId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteExpenseReport() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (reportId) => deleteExpenseReport(reportId),
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: ["expense-reports"] });
      queryClient.invalidateQueries({
        queryKey: ["expense-report", reportId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useSubmitExpenseReport() {
  const queryClient = useQueryClient();
  return useMutation<ExpenseReportSummary, Error, string>({
    mutationFn: (reportId) => submitExpenseReport(reportId),
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: ["expense-reports"] });
      queryClient.invalidateQueries({
        queryKey: ["expense-report", reportId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
