import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { portalApi, message, sessionVersion } from "./api";
import { usePortal } from "./context";
export function useResource(path) {
  const { user, staff } = usePortal();
  const query = useQuery({
    queryKey: ["portal-resource", user?._id, staff?._id,
      sessionVersion("participant"), sessionVersion("staff"), path],
    enabled: !!path,
    queryFn: async ({ signal }) => (await portalApi.get(path, { signal })).data,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
  const { refetch } = query;
  const reload = useCallback(async () => {
    if (path) await refetch();
  }, [path, refetch]);
  // Never show a cached form or registration eligibility while refreshing.
  const requireFresh = /^\/(events\/|registration-context|registrations\/|staff\/events)/.test(path || "");
  return {
    data: path ? query.data : null,
    error: query.error ? message(query.error) : "",
    loading: !!path && (query.isPending || (requireFresh && query.isFetching)),
    refreshing: query.isFetching,
    reload,
  };
}
