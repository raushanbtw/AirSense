import { useEffect, useState } from "react";
import { fetchEnvironment } from "../services/environmentService";

export default function useEnvironment(coords) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!coords) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchEnvironment(coords.latitude, coords.longitude)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.error || "Could not load environmental data.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coords]);

  return { data, loading, error };
}