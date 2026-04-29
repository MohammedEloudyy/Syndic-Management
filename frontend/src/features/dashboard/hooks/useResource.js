import { useQuery } from "@tanstack/react-query";

/**
 * useResource(fetchFn, params?)
 * Returns { data, meta, loading, error, refetch }
 * 
 * Re-implemented using TanStack Query for:
 * - Persistent server state orchestration
 * - Automatic background refetching
 * - Intelligent cache invalidation
 * - Consistent state across components
 */
export function useResource(fetchFn, params = {}) {
  const queryKey = [fetchFn.name || "resource", params];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchFn(params),
    // Map Laravel's response structure
    select: (res) => {
      if (res && Array.isArray(res.data)) {
        return {
          data: res.data,
          meta: res.meta ?? null,
        };
      }
      return {
        data: Array.isArray(res) ? res : [],
        meta: null,
      };
    },
  });

  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    // Add internal query object for more advanced usage if needed
    query,
  };
}
