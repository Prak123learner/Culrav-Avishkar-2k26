import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  portalApi,
  onSessionExpired,
  advanceSession,
  sessionVersion,
} from "./api";
import { PortalContext } from "./context";

function routeSessions(pathname) {
  if (/^\/(coordinator|admin)(?:\/|$)/.test(pathname))
    return { participant: false, staff: true };
  if (
    pathname === "/login" ||
    /^\/(portal|register)(?:\/|$)/.test(pathname)
  )
    return { participant: true, staff: false };
  return { participant: false, staff: false };
}

export function PortalProvider({ children }) {
  const { pathname } = useLocation();
  const required = routeSessions(pathname);
  const [user, setUserState] = useState(null),
    [staff, setStaffState] = useState(null),
    [hydratedPath, setHydratedPath] = useState(null);
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
    const unsubscribe = onSessionExpired((kind) => {
      if (!active) return;
      if (kind === "staff") setStaff(null);
      else setUser(null);
    });
    async function hydrate() {
      const needsParticipant =
        required.participant && !user && hydratedPath !== pathname;
      const needsStaff = required.staff && !staff && hydratedPath !== pathname;
      if (!needsParticipant && !needsStaff) {
        setHydratedPath(pathname);
        return;
      }
      const participantVersion = sessionVersion("participant"),
        staffVersion = sessionVersion("staff");
      try {
        const [u, s] = await Promise.all([
          needsParticipant
            ? portalApi.get("/auth/me").catch(() => null)
            : Promise.resolve(null),
          needsStaff
            ? portalApi.get("/staff/me").catch(() => null)
            : Promise.resolve(null),
        ]);
        if (!active) return;
        if (u && participantVersion === sessionVersion("participant"))
          setUserState(u.data.user);
        if (s && staffVersion === sessionVersion("staff"))
          setStaffState(s.data.staff);
      } finally {
        if (active) setHydratedPath(pathname);
      }
    }
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
    hydrate();
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [
    hydratedPath,
    pathname,
    required.participant,
    required.staff,
    setUser,
    setStaff,
    staff,
    user,
  ]);
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
  const loading =
    (required.participant && !user) || (required.staff && !staff)
      ? hydratedPath !== pathname
      : false;
  return (
    <PortalContext.Provider
      value={{ user, staff, setUser, setStaff, loading, logout }}
    >
      {children}
    </PortalContext.Provider>
  );
}
