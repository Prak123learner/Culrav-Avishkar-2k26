import { useCallback, useEffect, useRef, useState } from "react";
import { portalApi, message } from "./api";
export function useResource(path) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const requestId = useRef(0);
  const reload = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const result = await portalApi.get(path);
      if (currentRequest === requestId.current) setData(result.data);
    } catch (e) {
      if (currentRequest === requestId.current) setError(message(e));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    reload();
    return () => {
      requestId.current += 1;
    };
  }, [reload]);
  return { data, error, loading, reload };
}
