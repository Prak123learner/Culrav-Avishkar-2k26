import axios from "axios";
import { queryClient, isPortalQuery } from "./queryClient";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "/api/v1" : "http://localhost:3000/api/v1");

export const portalApi = axios.create({
  baseURL: `${apiBaseUrl.replace(/\/$/, "")}/portal`,
  withCredentials: true,
});
const expiredListeners = new Set();
const sessionVersions = { participant: 0, staff: 0 };
export const sessionVersion = (kind) => sessionVersions[kind];
export function advanceSession(kind) {
  sessionVersions[kind] += 1;
  void queryClient.cancelQueries({ predicate: isPortalQuery });
  queryClient.removeQueries({ predicate: isPortalQuery });
}
function sessionKind(path = "") {
  path = path.split("?")[0];
  if (path.startsWith("/staff/") && path !== "/staff/login") return "staff";
  if (
    path === "/auth/me" ||
    path === "/auth/logout" ||
    path === "/registration-context" ||
    /^\/(profile|teams|registrations)(\/|$)/.test(path) ||
    /^\/events\/[^/]+\/register$/.test(path) ||
    /^\/events\/[^/]+\/my-registration$/.test(path)
  )
    return "participant";
  return null;
}
portalApi.interceptors.request.use((config) => {
  const kind = sessionKind(config.url);
  if (kind) config.portalSessionVersion = sessionVersion(kind);
  return config;
});
export function onSessionExpired(listener) {
  expiredListeners.add(listener);
  return () => expiredListeners.delete(listener);
}
portalApi.interceptors.response.use(
  (response) => {
    if (!["get", "head", "options"].includes(response.config.method)) {
      // Screens explicitly reload after writes. Mark other cached views stale
      // without starting duplicate requests for every mounted component.
      void queryClient.invalidateQueries({ predicate: isPortalQuery, refetchType: "none" });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const kind = sessionKind(error.config?.url);
      if (kind && error.config.portalSessionVersion === sessionVersion(kind))
        for (const listener of expiredListeners) listener(kind);
    }
    return Promise.reject(error);
  },
);
export const message = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Unable to complete request";
