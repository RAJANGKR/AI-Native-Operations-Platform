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

/**
 * Create a new expense report.
 * Endpoint: POST /api/v1/expense-reports/
 */
export async function createExpenseReport(data: any): Promise<ExpenseReportSummary> {
  const response = await apiClient.post<ExpenseReportSummary>("/expense-reports/", data);
  return response.data;
}

/**
 * Partially update an existing expense report.
 * Endpoint: PATCH /api/v1/expense-reports/{reportId}
 */
export async function updateExpenseReport(
  reportId: string,
  data: any
): Promise<ExpenseReportSummary> {
  const response = await apiClient.patch<ExpenseReportSummary>(
    `/expense-reports/${reportId}`,
    data
  );
  return response.data;
}

/**
 * Delete an expense report by identifier.
 * Endpoint: DELETE /api/v1/expense-reports/{reportId}
 */
export async function deleteExpenseReport(reportId: string): Promise<void> {
  await apiClient.delete(`/expense-reports/${reportId}`);
}

/**
 * Submit a draft expense report for Treasurer audit.
 * Endpoint: POST /api/v1/expense-reports/{reportId}/submit
 */
export async function submitExpenseReport(reportId: string): Promise<ExpenseReportSummary> {
  const response = await apiClient.post<ExpenseReportSummary>(
    `/expense-reports/${reportId}/submit`
  );
  return response.data;
}
