import { useState, useEffect } from "react";
import { getDashboardStats } from "../api/dashboardApi";

export function useDashboardStats() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}
