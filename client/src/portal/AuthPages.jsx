import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { portalApi, message } from "./api";
import { usePortal } from "./context";
import {
  firebaseConfigured,
  signInWithGooglePopup,
  signOutOfFirebase,
} from "./firebase";
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
  async function login() {
    setBusy(true);
    setError("");
    try {
      const result = await signInWithGooglePopup();
      try {
        const { data } = await portalApi.post("/auth/google", {
          idToken: await result.user.getIdToken(),
        });
        setUser(data.user);
        navigate(destination, { replace: true });
      } finally {
        await signOutOfFirebase();
      }
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <div className="ca-portal">Loading session…</div>;
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
          <button disabled={busy || !firebaseConfigured} onClick={login}>
            {busy ? "Signing in…" : "Continue with Google"}
          </button>
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
  if (loading) return <div className="ca-portal">Loading session…</div>;
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
