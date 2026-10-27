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
import loginArt from "../assets/pages/login/Login_Page.png";
import loginBg from "../assets/common/backgrounds/Background_of_login_page.webp";
import "./portal.css";

function AuthArt() {
  return (
    <div className="ca-auth-art" aria-hidden="true">
      <img
        src={loginArt}
        alt="Festival Access Artwork"
        className="ca-auth-art-img"
      />
    </div>
  );
}

function PasswordField({ label, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const actionLabel = visible ? "Hide password" : "Show password";

  return (
    <label>
      {label}
      <span className="ca-password-field">
        <input {...inputProps} type={visible ? "text" : "password"} />
        <button
          type="button"
          className="ca-password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={actionLabel}
          aria-pressed={visible}
          title={actionLabel}
        >
          {visible ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.7 10.7 0 0112 4c5.5 0 9 5.2 9 5.2a14.7 14.7 0 01-2.2 2.7M6.3 6.3C4.2 7.7 3 9.2 3 9.2S6.5 16 12 16a9.3 9.3 0 003.1-.6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          )}
        </button>
      </span>
    </label>
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
    [busy, setBusy] = useState(false),
    [completing, setCompleting] = useState(false);
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
      setCompleting(true);
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
      setCompleting(false);
      setBusy(false);
    }
  }
  if (loading || completing)
    return <PortalLoading label="Opening your participant archive" />;
  if (user) return <Navigate to={destination} replace />;
  if (staff)
    return (
      <Navigate
        to={staff.role === "admin" ? "/admin" : "/coordinator"}
        replace
      />
    );
  return (
    <main
      className="ca-portal ca-auth-screen ca-auth-participant"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <section className="ca-card ca-auth ca-auth-login ca-auth-participant-card">
        <AuthArt />
        <div className="ca-auth-content">
          <span className="ca-kicker">Participant Portal</span>
          <h1>Participant Sign-in</h1>
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
            className="ca-google-btn"
            disabled={
              busy || preparing || preparationFailed || !firebaseConfigured
            }
            onClick={login}
          >
            <span>
              {busy
                ? "Continue in Google…"
                : preparing
                  ? "Preparing sign-in…"
                  : "Continue with Google"}
            </span>
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
    <main
      className="ca-portal ca-staff ca-auth-screen"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <form onSubmit={submit} className="ca-card ca-auth ca-auth-login">
        <AuthArt />
        <div className="ca-auth-content">
          <span className="ca-kicker">
            {adminLogin ? "Festival administration" : "Coordinator workspace"}
          </span>
          <h1>{adminLogin ? "Admin Login" : "Coordinator Login"}</h1>
          <p>
            Use the email granted access by your administrator. First-time
            accounts must replace their temporary password.
          </p>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              className="ca-input-email"
            />
          </label>
          <PasswordField
            label="Password"
            name="password"
            autoComplete="current-password"
            maxLength={128}
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center text-center cursor-pointer disabled:cursor-not-allowed"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {error && (
            <p role="alert" className="ca-error">
              {error}
            </p>
          )}
          <Link to="/login">
            <span>Participant Google sign-in</span>
            <span>➔</span>
          </Link>
        </div>
      </form>
    </main>
  );
}

export function ChangeStaffPassword() {
  const { staff, setStaff } = usePortal();
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
    <main
      className="ca-portal ca-staff ca-auth-screen ca-change-password-screen"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <form className="ca-card ca-auth ca-auth-login ca-auth-change-password" onSubmit={submit}>
        <AuthArt />
        <div className="ca-auth-content">
          <span className="ca-kicker">Account Security</span>
          <h1>Set your password</h1>
          <p className="ca-auth-subline">
            {staff.email} · Replace your temporary password to continue.
          </p>
          <PasswordField
            label="Temporary password"
            name="currentPassword"
            autoComplete="current-password"
            required
            maxLength={128}
          />
          <PasswordField
            label="New password"
            name="newPassword"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
          />
          <small>
            Use at least 12 characters including a letter and a number.
          </small>
          <PasswordField
            label="Confirm password"
            name="confirm"
            autoComplete="new-password"
            required
          />
          <button type="submit" disabled={busy} className="ca-primary-btn">
            {busy ? "Saving…" : "Set Password"}
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
