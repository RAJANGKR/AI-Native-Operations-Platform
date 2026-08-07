import apiClient from "@/services/api";
import { ExpenseReportSummary, ExpenseReportDetails } from "@/types/expense-report";

/**
 * Fetch all expense reports from FastAPI backend.
 * Endpoint: GET /api/v1/expense-reports/
 */
export async function getExpenseReports(): Promise<ExpenseReportSummary[]> {
  const response = await apiClient.get<ExpenseReportSummary[]>("/expense-reports/");
  return response.data;
}

/**
 * Fetch detailed expense report by identifier from FastAPI backend.
 * Endpoint: GET /api/v1/expense-reports/{reportId}
 */
export async function getExpenseReport(reportId: string): Promise<ExpenseReportDetails> {
  const response = await apiClient.get<ExpenseReportDetails>(`/expense-reports/${reportId}`);
  return response.data;
}
