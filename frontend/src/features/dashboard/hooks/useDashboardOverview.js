import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "../api/dashboardApi";

/**
 * useDashboardOverview
 * 
 * Orchestrates the dashboard state using the aggregated overview endpoint.
 * This is the primary source of truth for the Dashboard page.
 */
export function useDashboardOverview() {
  const query = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: getDashboardOverview,
    staleTime: 1000 * 60, // 60 seconds
  });

  return {
    overview: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    query,
  };
}
