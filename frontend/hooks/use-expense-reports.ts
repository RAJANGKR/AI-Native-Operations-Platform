import { useQuery } from "@tanstack/react-query";
import { getExpenseReports, getExpenseReport } from "@/services/expense-report";
import { ExpenseReportSummary, ExpenseReportDetails } from "@/types/expense-report";

/**
 * Centralized query caching & refresh parameters for expense reports (5 minutes).
 */
export const REPORTS_STALE_TIME = 5 * 60 * 1000;
export const REPORTS_REFETCH_INTERVAL = 5 * 60 * 1000;

/**
 * Hook for fetching list of all expense reports.
 * Query key: ["expense-reports"]
 */
export function useExpenseReports() {
  return useQuery<ExpenseReportSummary[], Error>({
    queryKey: ["expense-reports"],
    queryFn: getExpenseReports,
    staleTime: REPORTS_STALE_TIME,
    refetchInterval: REPORTS_REFETCH_INTERVAL,
  });
}

/**
 * Hook for fetching single expense report details by identifier.
 * Query key: ["expense-report", reportId]
 */
export function useExpenseReport(reportId: string) {
  return useQuery<ExpenseReportDetails, Error>({
    queryKey: ["expense-report", reportId],
    queryFn: () => getExpenseReport(reportId),
    enabled: Boolean(reportId),
    staleTime: REPORTS_STALE_TIME,
    refetchInterval: REPORTS_REFETCH_INTERVAL,
  });
}
