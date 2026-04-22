import { useState, useEffect, useCallback } from "react";

/**
 * useResource(fetchFn, params?)
 * Returns { data, meta, loading, error, refetch }
 * Works with paginated Laravel responses ({ data: [], meta: {} })
 * and plain array responses.
 */
export function useResource(fetchFn, params = {}) {
  const [data, setData]       = useState([]);
  const [meta, setMeta]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchFn(params)
      .then((res) => {
        // Laravel paginated: { data: [], meta: {} }
        if (res && Array.isArray(res.data)) {
          setData(res.data);
          setMeta(res.meta ?? null);
        } else {
          // plain array
          setData(Array.isArray(res) ? res : []);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, meta, loading, error, refetch: fetch };
}
