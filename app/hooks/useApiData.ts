import { useEffect, useState } from 'react';
import { apiGet } from '../services/api';

// Generic hook that fetches data from the given API path and returns { data, loading, error }.
// Aborts the in-flight request on unmount or when the path changes to prevent stale updates.
export const useApiData = <T>(path: string, initialData: T) => {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    setLoading(true);
    setError(null);

    apiGet<T>(path, controller.signal)
      .then((response) => {
        if (!isActive) return;
        setData(response);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : 'Unable to load data.');
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [path]);

  return { data, loading, error };
};
