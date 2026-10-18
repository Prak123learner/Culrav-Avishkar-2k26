import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { portalApi, message } from "./api";
import { usePortal } from "./context";
import {
  firebaseConfigured,
  prepareGoogleSignIn,
  signInWithGooglePopup,
  signOutOfFirebase,
} from "./firebase";
import { PortalLoading } from "./PortalLoading";
import { authDiagnostic } from "./authDiagnostics";
import "./portal.css";

function AuthArt() {
  return (
    <div className="ca-auth-art" aria-hidden="true">
      <img src="/img/logo_avishkar_culrav.png" alt="" />
      <div className="ca-auth-art-caption">
        <span>Culrav × Avishkar</span>
        <strong>Festival access / 2026</strong>
      </div>
      <span className="ca-auth-art-index">CA / 26</span>
    </div>
  );
}

export function GoogleLogin() {
  const location = useLocation();
  const returnTo = location.state?.returnTo;
  const destination =
    typeof returnTo === "string" &&
    (returnTo.startsWith("/portal/") || returnTo.startsWith("/register/"))
      ? returnTo
      : "/portal";
  const { user, staff, setUser, loading } = usePortal(),
    navigate = useNavigate();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const loginInFlight = useRef(false);
  const blockedAttempts = useRef(0);
  const [preparing, setPreparing] = useState(firebaseConfigured);
  const [preparationFailed, setPreparationFailed] = useState(false);
  const [preparationAttempt, setPreparationAttempt] = useState(0);
  useEffect(() => {
    if (!firebaseConfigured) return;
    let active = true;
    setPreparing(true);
    setPreparationFailed(false);
    // This is preparation only. Never open a popup from an effect or timer.
    // Offer retry on a slow connection without enabling an unprepared popup.
    const timeout = setTimeout(() => {
      if (!active) return;
      setPreparationFailed(true);
      setError(
        "Google sign-in is taking longer to prepare. Check your connection and retry.",
      );
    }, 15000);
    prepareGoogleSignIn()
      .then(() => {
        if (active) {
          setPreparationFailed(false);
          setError("");
        }
      })
      .catch(() => {
        if (active) {
          setPreparationFailed(true);
          setError(
            "Unable to prepare Google sign-in. Check your connection and retry.",
          );
        }
      })
      .finally(() => {
        clearTimeout(timeout);
        if (active) setPreparing(false);
      });
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [preparationAttempt]);
  async function login(event) {
    authDiagnostic("button:click", {
      trustedClick: event.isTrusted,
      preparing,
      preparationFailed,
      inFlight: loginInFlight.current,
    });
    if (loginInFlight.current || preparing || preparationFailed) return;
    loginInFlight.current = true;
    let firebaseSignedIn = false;
    setBusy(true);
    setError("");
    try {
      // Start inside the click handler: no fetch, timer or dynamic import first.
      const result = await signInWithGooglePopup();
      blockedAttempts.current = 0;
      firebaseSignedIn = true;
      authDiagnostic("backend-login:start");
      const { data } = await portalApi.post("/auth/google", {
        idToken: await result.user.getIdToken(),
      });
      setUser(data.user);
      authDiagnostic("backend-login:success");
      navigate(destination, { replace: true });
    } catch (e) {
      authDiagnostic("login:failed", {
        code: e?.code,
        httpStatus: e?.response?.status,
      });
      if (e?.code === "auth/popup-blocked") blockedAttempts.current += 1;
      const popupErrors = {
        "auth/popup-blocked":
          blockedAttempts.current === 1
            ? "The sign-in window could not open. Please click Continue with Google once more."
            : "Your browser is still blocking the sign-in window. Use the blocked-popup icon in the address bar to allow it for this site, then try again.",
        "auth/popup-closed-by-user":
          "The Google sign-in window closed before sign-in finished. Click Continue with Google to try again.",
        "auth/cancelled-popup-request":
          "Another sign-in attempt interrupted this one. Please try again.",
        "auth/unauthorized-domain":
          "Google sign-in is not configured for this website address. Please contact the festival administrator.",
      };
      setError(popupErrors[e?.code] || message(e));
    } finally {
      if (firebaseSignedIn) {
        // The backend cookie owns the portal session. Firebase cleanup must not
        // turn an otherwise successful portal login into a reported failure.
        await signOutOfFirebase().catch(() => {});
      }
      loginInFlight.current = false;
      setBusy(false);
    }
  }
  if (loading) return <PortalLoading label="Restoring participant access" />;
  if (user) return <Navigate to={destination} replace />;
  if (staff)
    return (
      <Navigate
        to={staff.role === "admin" ? "/admin" : "/coordinator"}
        replace
      />
    );
  return (
    <main className="ca-portal ca-auth-screen ca-auth-participant">
      <section className="ca-card ca-auth ca-auth-login ca-auth-participant-card">
        <AuthArt />
        <div className="ca-auth-content">
          <span className="ca-kicker">Participant portal / 01</span>
          <h1>Participant sign-in</h1>
          <p>
            Continue with your Google account. We’ll assign your permanent CA
            ID, then you can complete your profile and register for events.
          </p>
          {!firebaseConfigured && (
            <p className="ca-notice">
              Google sign-in is awaiting Firebase configuration. Contact the
              festival administrator.
            </p>
          )}
          <button
            type="button"
            disabled={
              busy || preparing || preparationFailed || !firebaseConfigured
            }
            onClick={login}
          >
            {busy
              ? "Signing in…"
              : preparing
                ? "Preparing sign-in…"
                : "Continue with Google"}
          </button>
          {preparationFailed && (
            <button
              type="button"
              className="ca-secondary"
              onClick={() => {
                setError("");
                setPreparationAttempt((attempt) => attempt + 1);
              }}
            >
              Retry sign-in preparation
            </button>
          )}
          {error && (
            <p role="alert" className="ca-error">
              {error}
            </p>
          )}
          <Link to="/coordinator/login">Coordinator / admin login</Link>
        </div>
      </section>
    </main>
  );
}

export function StaffLogin({ adminLogin = false }) {
  const { staff, setStaff, loading } = usePortal();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await portalApi.post(
        "/staff/login",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      setStaff(data.staff);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <PortalLoading label="Restoring staff access" />;
  if (staff)
    return (
      <Navigate
        to={staff.role === "admin" ? "/admin" : "/coordinator"}
        replace
      />
    );
  return (
    <main className="ca-portal ca-staff ca-auth-screen">
      <form onSubmit={submit} className="ca-card ca-auth ca-auth-login">
        <AuthArt />
        <div className="ca-auth-content">
          <span className="ca-kicker">
            {adminLogin ? "Festival administration" : "Coordinator workspace"}
          </span>
          <h1>{adminLogin ? "Admin login" : "Coordinator login"}</h1>
          <p>
            Use the email granted access by your administrator. First-time
            accounts must replace their temporary password.
          </p>
          <label>
            Email
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              maxLength={128}
              required
            />
          </label>
          <button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          {error && (
            <p role="alert" className="ca-error">
              {error}
            </p>
          )}
          <Link to="/login">Participant Google sign-in</Link>
        </div>
      </form>
    </main>
  );
}

export function ChangeStaffPassword() {
  const { staff, setStaff, logout } = usePortal();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    if (body.newPassword !== body.confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await portalApi.post("/staff/password", body);
      setStaff(data.staff);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="ca-portal ca-staff">
      <form className="ca-card ca-auth" onSubmit={submit}>
        <AuthArt />
        <div className="ca-auth-content">
          <span className="ca-kicker">Account security / First sign-in</span>
          <h1>Set your password</h1>
          <p>
            {staff.email} · {staff.caId}
          </p>
          <p>
            You must replace your temporary password before accessing assigned
            categories.
          </p>
          <label>
            Temporary password
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
            />
          </label>
          <label>
            New password
            <input
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
            />
          </label>
          <small>
            Use at least 12 characters including a letter and a number.
          </small>
          <label>
            Confirm password
            <input
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
            />
          </label>
          <button disabled={busy}>Change password</button>
          <button
            type="button"
            className="ca-secondary"
            onClick={() => logout("staff").catch((e) => setError(message(e)))}
          >
            Sign out
          </button>
          {error && (
            <p role="alert" className="ca-error">
              {error}
            </p>
          )}
        </div>
      </form>
    </main>
  );
}
