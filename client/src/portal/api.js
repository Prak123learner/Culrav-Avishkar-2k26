import axios from "axios";
export const portalApi = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api/v1/portal"
    : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1"}/portal`,
  withCredentials: true,
});
const expiredListeners = new Set();
const sessionVersions = { participant: 0, staff: 0 };
export const sessionVersion = (kind) => sessionVersions[kind];
export function advanceSession(kind) {
  sessionVersions[kind] += 1;
}
function sessionKind(path = "") {
  if (path.startsWith("/staff/") && path !== "/staff/login") return "staff";
  if (
    path === "/auth/me" ||
    path === "/auth/logout" ||
    /^\/(profile|teams|registrations)(\/|$)/.test(path) ||
    /^\/events\/[^/]+\/register$/.test(path)
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
  (response) => response,
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
