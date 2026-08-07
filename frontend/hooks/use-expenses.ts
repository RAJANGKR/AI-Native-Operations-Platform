import { useQuery } from "@tanstack/react-query";
import { getExpenses, getExpense } from "@/services/expense";
import { ExpenseDetail } from "@/types/expense";

export const EXPENSES_STALE_TIME = 5 * 60 * 1000;
export const EXPENSES_REFETCH_INTERVAL = 5 * 60 * 1000;

export function useExpenses(reportId: string) {
  return useQuery<ExpenseDetail[], Error>({
    queryKey: ["expenses", reportId],
    queryFn: () => getExpenses(reportId),
    enabled: Boolean(reportId),
    staleTime: EXPENSES_STALE_TIME,
    refetchInterval: EXPENSES_REFETCH_INTERVAL,
  });
}

export function useExpense(expenseId: string) {
  return useQuery<ExpenseDetail, Error>({
    queryKey: ["expense", expenseId],
    queryFn: () => getExpense(expenseId),
    enabled: Boolean(expenseId),
    staleTime: EXPENSES_STALE_TIME,
    refetchInterval: EXPENSES_REFETCH_INTERVAL,
  });
}
