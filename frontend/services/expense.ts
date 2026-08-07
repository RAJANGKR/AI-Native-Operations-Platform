import apiClient from "@/services/api";
import {
  ExpenseDetail,
  ExpenseCreate,
  ExpenseUpdate,
} from "@/types/expense";

/**
 * Fetch all expenses belonging to a specific expense report.
 * Endpoint: GET /api/v1/expenses/report/{reportId}
 */
export async function getExpenses(reportId: string): Promise<ExpenseDetail[]> {
  const response = await apiClient.get<ExpenseDetail[]>(`/expenses/report/${reportId}`);
  return response.data;
}

/**
 * Fetch a single expense by identifier.
 * Endpoint: GET /api/v1/expenses/{expenseId}
 */
export async function getExpense(expenseId: string): Promise<ExpenseDetail> {
  const response = await apiClient.get<ExpenseDetail>(`/expenses/${expenseId}`);
  return response.data;
}

/**
 * Create a new expense item attached to an expense report.
 * Endpoint: POST /api/v1/expenses/
 */
export async function createExpense(data: ExpenseCreate): Promise<ExpenseDetail> {
  const response = await apiClient.post<ExpenseDetail>("/expenses/", data);
  return response.data;
}

/**
 * Partially update an existing expense item.
 * Endpoint: PATCH /api/v1/expenses/{expenseId}
 */
export async function updateExpense(
  expenseId: string,
  data: ExpenseUpdate
): Promise<ExpenseDetail> {
  const response = await apiClient.patch<ExpenseDetail>(`/expenses/${expenseId}`, data);
  return response.data;
}

/**
 * Delete an expense item by identifier.
 * Endpoint: DELETE /api/v1/expenses/{expenseId}
 */
export async function deleteExpense(expenseId: string): Promise<void> {
  await apiClient.delete(`/expenses/${expenseId}`);
}
