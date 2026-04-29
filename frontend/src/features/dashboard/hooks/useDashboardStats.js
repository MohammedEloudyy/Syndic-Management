import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/dashboardApi";

export function useDashboardStats() {
  const query = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60, // 60 seconds (stats are expensive)
  });

  return {
    stats: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
