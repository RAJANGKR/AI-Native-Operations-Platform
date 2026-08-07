import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/services/dashboard";
import { DashboardResponse } from "@/types/dashboard";

/**
 * Centralized dashboard data refresh configuration (5 minutes).
 */
export const DASHBOARD_STALE_TIME = 5 * 60 * 1000;
export const DASHBOARD_REFETCH_INTERVAL = 5 * 60 * 1000;

/**
 * Custom hook for fetching and caching aggregated dashboard data using TanStack Query.
 * Query key: ["dashboard"]
 */
export function useDashboard() {
  return useQuery<DashboardResponse, Error>({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    staleTime: DASHBOARD_STALE_TIME,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}
