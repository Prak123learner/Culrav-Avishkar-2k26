import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  portalApi,
  onSessionExpired,
  advanceSession,
  sessionVersion,
} from "./api";
import { PortalContext } from "./context";

const SESSION_HINT_KEY = "ca-portal-session";

function readSessionHint(kind) {
  try {
    return localStorage.getItem(`${SESSION_HINT_KEY}-${kind}`) || "unknown";
  } catch {
    return "unknown";
  }
}

function writeSessionHint(kind, state) {
  try {
    localStorage.setItem(`${SESSION_HINT_KEY}-${kind}`, state);
  } catch {
    /* Session restoration still works on protected routes without storage. */
  }
}

function routeSessions(pathname, participantHint, staffHint) {
  if (/^\/(coordinator|admin)(?:\/|$)/.test(pathname))
    return { participant: false, staff: true };
  if (
    pathname === "/login" ||
    /^\/(portal|register)(?:\/|$)/.test(pathname)
  )
    return { participant: true, staff: false };
  // A public page performs one participant check when this browser has no
  // session history, or restores a session known to exist from another tab.
  // Known anonymous browsers do not keep calling /auth/me on public routes.
  return {
    participant: participantHint !== "anonymous",
    staff: staffHint === "active",
  };
}

export function PortalProvider({ children }) {
  const { pathname } = useLocation();
  const [user, setUserState] = useState(null),
    [staff, setStaffState] = useState(null),
    [hydratedPath, setHydratedPath] = useState(null),
    [participantHint, setParticipantHint] = useState(() =>
      readSessionHint("participant"),
    ),
    [staffHint, setStaffHint] = useState(() => readSessionHint("staff"));
  const required = routeSessions(pathname, participantHint, staffHint);
  const setUser = useCallback((value) => {
    advanceSession("participant");
    setUserState(value);
    const state = value ? "active" : "anonymous";
    setParticipantHint(state);
    writeSessionHint("participant", state);
  }, []);
  const setStaff = useCallback((value) => {
    advanceSession("staff");
    setStaffState(value);
    const state = value ? "active" : "anonymous";
    setStaffHint(state);
    writeSessionHint("staff", state);
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
        if (u && participantVersion === sessionVersion("participant")) {
          setUserState(u.data.user);
          setParticipantHint("active");
          writeSessionHint("participant", "active");
        }
        if (s && staffVersion === sessionVersion("staff")) {
          setStaffState(s.data.staff);
          setStaffHint("active");
          writeSessionHint("staff", "active");
        }
      } finally {
        if (active) setHydratedPath(pathname);
      }
    }
    const onStorage = (event) => {
      if (!event.newValue) return;
      if (event.key === `${SESSION_HINT_KEY}-participant`) {
        setParticipantHint(event.newValue);
        if (event.newValue === "anonymous") {
          advanceSession("participant");
          setUserState(null);
        } else {
          setHydratedPath(null);
        }
        return;
      }
      if (event.key === `${SESSION_HINT_KEY}-staff`) {
        setStaffHint(event.newValue);
        if (event.newValue === "anonymous") {
          advanceSession("staff");
          setStaffState(null);
        } else {
          setHydratedPath(null);
        }
        return;
      }
      if (event.key !== "ca-portal-logout") return;
      try {
        const { kind } = JSON.parse(event.newValue);
        if (kind === "staff") {
          setStaffHint("anonymous");
          setStaffState(null);
        }
        if (kind === "participant") {
          setParticipantHint("anonymous");
          setUserState(null);
        }
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
    participantHint,
    staffHint,
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
