import { useQuery } from "@tanstack/react-query";
import { getAnnualOverview } from "../api/dashboardApi";

/**
 * useAnnualOverview
 * 
 * Fetches annual dashboard data for a specific year.
 * Uses React Query with the year as a dynamic key for automatic refetching.
 */
export function useAnnualOverview(year) {
  const query = useQuery({
    queryKey: ["annualOverview", year],
    queryFn: () => getAnnualOverview(year),
    staleTime: 1000 * 120, // 2 minutes
    enabled: !!year,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    query,
  };
}
