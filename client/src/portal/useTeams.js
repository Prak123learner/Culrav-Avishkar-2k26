import { useQuery } from "@tanstack/react-query";
import { message, portalApi, sessionVersion } from "./api";
import { usePortal } from "./context";

export function useTeams(enabled = true) {
  const { user } = usePortal();
  const query = useQuery({
    // Never reuse another participant's data or data from a previous login.
    queryKey: ["portal-teams", user?._id, sessionVersion("participant")],
    enabled: enabled && !!user,
    queryFn: async ({ signal }) =>
      (await portalApi.get("/teams", { signal })).data,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
  return {
    data: query.data,
    error: query.error ? message(query.error) : "",
    loading: query.isLoading,
    refreshing: query.isFetching,
    reload: () => query.refetch({ throwOnError: true }),
  };
}
