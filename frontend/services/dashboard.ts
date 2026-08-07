import apiClient from "@/services/api";
import { DashboardResponse } from "@/types/dashboard";

/**
 * Fetch aggregated dashboard analytics metrics from the FastAPI backend.
 * Endpoint: GET /api/v1/dashboard
 */
export async function getDashboard(): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>("/dashboard");
  return response.data;
}
