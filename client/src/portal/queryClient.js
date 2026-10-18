import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();
export const isPortalQuery = (query) =>
  typeof query.queryKey[0] === "string" && query.queryKey[0].startsWith("portal-");
