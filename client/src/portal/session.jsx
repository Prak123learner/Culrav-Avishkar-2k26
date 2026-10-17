import { useCallback, useEffect, useState } from "react";
import {
  portalApi,
  onSessionExpired,
  advanceSession,
  sessionVersion,
} from "./api";
import { PortalContext } from "./context";
export function PortalProvider({ children }) {
  const [user, setUserState] = useState(null),
    [staff, setStaffState] = useState(null),
    [loading, setLoading] = useState(true);
  const setUser = useCallback((value) => {
    advanceSession("participant");
    setUserState(value);
  }, []);
  const setStaff = useCallback((value) => {
    advanceSession("staff");
    setStaffState(value);
  }, []);
  useEffect(() => {
    let active = true;
    let pending = false;
    const unsubscribe = onSessionExpired((kind) => {
      if (!active) return;
      if (kind === "staff") setStaff(null);
      else setUser(null);
    });
    async function refresh() {
      if (pending) return;
      pending = true;
      const participantVersion = sessionVersion("participant"),
        staffVersion = sessionVersion("staff");
      try {
        const [u, s] = await Promise.allSettled([
          portalApi.get("/auth/me"),
          portalApi.get("/staff/me"),
        ]);
        if (!active) return;
        if (
          u.status === "fulfilled" &&
          participantVersion === sessionVersion("participant")
        )
          setUserState(u.value.data.user);
        if (
          s.status === "fulfilled" &&
          staffVersion === sessionVersion("staff")
        )
          setStaffState(s.value.data.staff);
        setLoading(false);
      } finally {
        pending = false;
      }
    }
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onStorage = (event) => {
      if (event.key !== "ca-portal-logout" || !event.newValue) return;
      try {
        const { kind } = JSON.parse(event.newValue);
        if (kind === "staff") setStaff(null);
        if (kind === "participant") setUser(null);
      } catch {
        /* Ignore unrelated malformed browser storage. */
      }
    };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
    };
  }, [setUser, setStaff]);
  async function logout(kind = "participant") {
    await portalApi.post(kind === "staff" ? "/staff/logout" : "/auth/logout");
    if (kind === "staff") setStaff(null);
    else setUser(null);
    try {
      localStorage.setItem(
        "ca-portal-logout",
        JSON.stringify({ kind, at: Date.now() }),
      );
    } catch {
      /* Logout still works when browser storage is unavailable. */
    }
  }
  return (
    <PortalContext.Provider
      value={{ user, staff, setUser, setStaff, loading, logout }}
    >
      {children}
    </PortalContext.Provider>
  );
}
