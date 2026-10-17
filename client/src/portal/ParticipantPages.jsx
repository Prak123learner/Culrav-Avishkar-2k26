import { useEffect, useLayoutEffect, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { portalApi, message } from "./api";
import { usePortal } from "./context";
import { useResource } from "./useResource";
import { FormFields, AnswerView } from "./FormFields";
import { courses, courseYears, branches, branchName } from "./profileOptions";
import "./portal.css";
const formatDeadline = (value) =>
  new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
const complete = (u) =>
  !!(
    u?.college &&
    u.registrationNumber &&
    u.course &&
    Number.isInteger(u.year) &&
    u.year >= 1 &&
    u.year <= courseYears[u.course] &&
    u.branch &&
    u.phone
  );
function Guard({ children, requireComplete = false }) {
  const { user, loading } = usePortal();
  const location = useLocation();
  if (loading) return <main className="ca-portal">Loading…</main>;
  if (user && requireComplete && !complete(user)) {
    return (
      <Navigate
        to="/portal"
        state={{ returnTo: location.pathname, profileRequired: true }}
        replace
      />
    );
  }
  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ returnTo: location.pathname }} replace />
  );
}
export function ParticipantHome() {
  return (
    <Guard>
      <Workspace />
    </Guard>
  );
}
function Workspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const [registrationRedirect] = useState(() => {
    const state = location.state;
    if (!state?.focusRegistrationId && !state?.alreadyRegisteredEvent)
      return null;
    const key = `ca-portal-registration-redirect:${location.key}`;
    if (sessionStorage.getItem(key)) return null;
    sessionStorage.setItem(key, "seen");
    return state;
  });
  const { user, logout } = usePortal(),
    [tab, setTab] = useState(
      location.state?.tab ||
        (location.state?.returnTo || !complete(user)
          ? "profile"
          : "registrations"),
    ),
    [error, setError] = useState("");
  // Registration redirects carry a one-time focus/notice state. Replace that
  // history entry before child effects run so a refresh or tab change is normal.
  useLayoutEffect(() => {
    if (!location.state?.focusRegistrationId && !location.state?.alreadyRegisteredEvent)
      return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);
  return (
    <main className="ca-portal ca-participant">
      <header className="ca-heading ca-workspace-heading">
        <div>
          <span className="ca-kicker">Participant access / 2026</span>
          <p>{user.caId}</p>
          <h1>Welcome, {user.name}</h1>
        </div>
        <button
          className="ca-secondary"
          onClick={() => logout().catch((e) => setError(message(e)))}
        >
          Sign out
        </button>
      </header>
      {error && (
        <p className="ca-error" role="alert">
          {error}
        </p>
      )}
      <nav className="ca-tabs">
        {["profile", "registrations", "teams"].map((t) => (
          <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}>
            {t === "registrations" ? "Registered events" : t}
          </button>
        ))}
      </nav>
      {tab === "profile" ? (
        <Profile />
      ) : tab === "teams" ? (
        <Teams />
      ) : (
        <Registrations
          focusRegistrationId={registrationRedirect?.focusRegistrationId}
          alreadyRegisteredEvent={registrationRedirect?.alreadyRegisteredEvent}
        />
      )}
    </main>
  );
}
function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = usePortal(),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false),
    [busy, setBusy] = useState(false),
    [pendingProfile, setPendingProfile] = useState(null),
    [acknowledged, setAcknowledged] = useState(false),
    [course, setCourse] = useState(user.course || ""),
    [year, setYear] = useState(user.year || ""),
    [branch, setBranch] = useState(() =>
      branches.some(([, label]) => label === branchName(user.branch))
        ? branchName(user.branch)
        : user.branch
          ? "Other"
          : "",
    ),
    [otherBranch, setOtherBranch] = useState(user.branch || "");
  const locked = !!user.profileLockedAt || complete(user);
  function requestConfirmation(e) {
    e.preventDefault();
    if (locked || busy) return;
    const body = Object.fromEntries(new FormData(e.currentTarget));
    body.course = course;
    body.year = Number(year);
    body.branch = branch === "Other" ? otherBranch.trim() : branch;
    setAcknowledged(false);
    setPendingProfile(body);
    setError("");
  }
  async function save() {
    if (!pendingProfile || !acknowledged || busy) return;
    setBusy(true);
    setSaved(false);
    setError("");
    try {
      const { data } = await portalApi.patch("/profile", {
        ...pendingProfile,
        acknowledged: true,
      });
      setUser(data.user);
      setSaved(true);
      setPendingProfile(null);
      const returnTo = location.state?.returnTo;
      if (
        typeof returnTo === "string" &&
        (returnTo.startsWith("/portal/events/") ||
          returnTo.startsWith("/register/"))
      ) {
        navigate(returnTo, { replace: true });
      }
    } catch (e) {
      setError(message(e));
      setPendingProfile(null);
      if (e.response?.status === 409) {
        try {
          const { data } = await portalApi.get("/auth/me");
          setUser(data.user);
        } catch {
          // Keep the original save error visible; the next refresh restores state.
        }
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="ca-card ca-form" onSubmit={requestConfirmation}>
      <h2>Your participant profile</h2>
      {location.state?.profileRequired && !complete(user) && (
        <p role="status" className="ca-notice">
          Complete your profile before opening the registration form. Saving
          will return you to your event.
        </p>
      )}
      <p>
        CA ID: <strong>{user.caId}</strong>
        <br />
        Google email: {user.email}
      </p>
      <p>These details accompany your registrations automatically.</p>
      <p>
        {locked
          ? "Your saved details are locked and cannot be changed."
          : "Check your details carefully. You can save this profile only once."}
      </p>
      <fieldset
        className="ca-profile-fields"
        disabled={locked || busy || !!pendingProfile}
      >
        {[
          ["name", "Full name"],
          ["college", "College"],
          [
            "registrationNumber",
            "College registration number (or N/A if not applicable)",
          ],
          ["phone", "Phone"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              key={`${user.updatedAt}-${key}`}
              name={key}
              defaultValue={
                user[key] || (key === "college" ? "MNNIT Allahabad" : "")
              }
              required
              maxLength={key === "phone" ? 10 : 200}
              type={key === "phone" ? "tel" : "text"}
              inputMode={key === "phone" ? "numeric" : undefined}
              pattern={key === "phone" ? "[6-9][0-9]{9}" : undefined}
              onInvalid={
                key === "phone"
                  ? (event) =>
                      event.currentTarget.setCustomValidity("Invalid number")
                  : undefined
              }
              onInput={
                key === "phone"
                  ? (event) => {
                      const input = event.currentTarget;
                      const digits = input.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 10);
                      if (input.value !== digits) input.value = digits;
                      input.setCustomValidity("");
                    }
                  : undefined
              }
              onPaste={
                key === "phone"
                  ? (event) => {
                      const input = event.currentTarget;
                      const selected =
                        (input.selectionEnd ?? 0) - (input.selectionStart ?? 0);
                      const pasted = event.clipboardData.getData("text");
                      if (
                        !/^[0-9]+$/.test(pasted) ||
                        input.value.length - selected + pasted.length > 10
                      ) {
                        event.preventDefault();
                        input.setCustomValidity("Invalid number");
                        input.reportValidity();
                      }
                    }
                  : undefined
              }
            />
          </label>
        ))}
        <label>
          Course
          <select
            required
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              setYear("");
            }}
          >
            <option value="">Select your course</option>
            {courses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year
          <select
            required
            value={year}
            disabled={!course}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">
              {course ? "Select your year" : "Select a course first"}
            </option>
            {Array.from({ length: courseYears[course] || 0 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {["1st Year", "2nd Year", "3rd Year", "4th Year"][index]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Branch
          <select
            required
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">Select your branch</option>
            {branches.map(([, label]) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </label>
        {branch === "Other" && (
          <label>
            Enter your branch
            <input
              required
              maxLength={200}
              value={otherBranch}
              onChange={(e) => setOtherBranch(e.target.value)}
            />
          </label>
        )}
      </fieldset>
      {!locked && (
        <button type="submit" disabled={busy}>
          Save profile
        </button>
      )}
      {saved && <p role="status">Profile saved.</p>}
      {pendingProfile && (
        <div
          className="ca-profile-confirm-backdrop"
          role="presentation"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !busy) setPendingProfile(null);
          }}
        >
          <div
            className="ca-profile-confirm ca-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ca-profile-confirm-title"
          >
            <h3 id="ca-profile-confirm-title">Confirm your profile details</h3>
            <p>
              Please check these details before saving. Your name and profile
              details cannot be edited afterward.
            </p>
            <dl>
              {[
                ["Name", pendingProfile.name],
                ["Google email", user.email],
                ["College", pendingProfile.college],
                [
                  "College registration number",
                  pendingProfile.registrationNumber,
                ],
                ["Course", pendingProfile.course],
                [
                  "Year",
                  `${pendingProfile.year}${["st", "nd", "rd", "th"][pendingProfile.year - 1] || "th"} Year`,
                ],
                ["Branch", pendingProfile.branch],
                ["Phone", pendingProfile.phone],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <label className="ca-choice">
              <input
                type="checkbox"
                autoFocus
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
              />
              I have checked these details and understand I cannot edit them
              after saving.
            </label>
            <div className="ca-toolbar">
              <button
                type="button"
                className="ca-secondary"
                disabled={busy}
                onClick={() => setPendingProfile(null)}
              >
                Go back and check
              </button>
              <button
                type="button"
                disabled={!acknowledged || busy}
                onClick={save}
              >
                {busy ? "Saving…" : "Confirm and save profile"}
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="ca-error">
          {error}
        </p>
      )}
    </form>
  );
}
function Teams() {
  const resource = useResource("/teams"),
    { user } = usePortal(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function action(path, body) {
    setBusy(true);
    setError("");
    try {
      await portalApi.post(path, body);
      await resource.reload();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>Your teams & invitations</h2>
      <p>
        Invite members using their CA IDs. Every member must accept before the
        leader registers. After a team is registered for an event, its roster is
        locked. Create another team if you need a different roster.
      </p>
      <form
        className="ca-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          action("/teams", { name: new FormData(e.currentTarget).get("name") });
        }}
      >
        <label>
          New team name
          <input name="name" required maxLength={100} />
        </label>
        <button disabled={busy}>Create team</button>
      </form>
      {(error || resource.error) && (
        <p className="ca-error" role="alert">
          {error || resource.error}
        </p>
      )}
      {resource.loading && <p>Loading teams…</p>}
      <div className="ca-grid">
        {resource.data?.teams.map((t) => {
          const pending = t.pendingIds.some((p) => p._id === user._id),
            leader = t.leaderId === user._id;
          return (
            <article className="ca-card" key={t._id}>
              <h3>{t.name}</h3>
              {t.locked && <p>Roster locked after event registration.</p>}
              {pending ? (
                <div className="ca-toolbar">
                  <button
                    disabled={busy || t.locked}
                    onClick={() =>
                      action(`/teams/${t._id}/respond`, { accept: true })
                    }
                  >
                    Accept invitation
                  </button>
                  <button
                    className="ca-secondary"
                    disabled={busy || t.locked}
                    onClick={() =>
                      action(`/teams/${t._id}/respond`, { accept: false })
                    }
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <>
                  <ul>
                    {t.memberIds.map((p) => (
                      <li key={p._id}>
                        {p.name} · {p.caId}
                        {p._id === t.leaderId
                          ? " · Leader"
                          : (leader || p._id === user._id) && (
                              <button
                                className="ca-inline"
                                disabled={busy || t.locked}
                                onClick={() =>
                                  action(`/teams/${t._id}/remove`, {
                                    memberId: p._id,
                                  })
                                }
                              >
                                {leader ? "Remove" : "Leave"}
                              </button>
                            )}
                      </li>
                    ))}
                  </ul>
                  <p>Pending invitations:</p>
                  <ul>
                    {t.pendingIds.map((p) => (
                      <li key={p._id}>
                        {p.name} · {p.caId}
                        {leader && (
                          <button
                            className="ca-inline"
                            disabled={busy || t.locked}
                            onClick={() =>
                              action(`/teams/${t._id}/remove`, {
                                memberId: p._id,
                              })
                            }
                          >
                            Cancel
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {leader && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        action(`/teams/${t._id}/invite`, {
                          caId: new FormData(e.currentTarget).get("caId"),
                        });
                      }}
                    >
                      <label>
                        Invite by CA ID
                        <input
                          name="caId"
                          placeholder="CA-2026-000001"
                          required
                        />
                      </label>
                      <button disabled={busy || t.locked}>
                        Invite participant
                      </button>
                    </form>
                  )}
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
export function RegistrationPage({ eventId, eventData = null }) {
  const { id } = useParams();
  const { user, loading: sessionLoading } = usePortal();
  const resource = useResource(eventData ? null : `/events/${eventId || id}`);
  if (!eventData && resource.loading)
    return <main className="ca-portal">Loading event…</main>;
  if (!eventData && resource.error) {
    return (
      <main className="ca-portal">
        <p role="alert" className="ca-error">
          {resource.error}
        </p>
        <button onClick={resource.reload}>Try again</button>
      </main>
    );
  }
  const event = eventData || resource.data?.event;
  if (!event?.formPublished && !sessionLoading && !user) {
    return <Navigate to="/coming-soon" replace />;
  }
  if (!eventData && !eventId && event.categoryId?.slug) {
    return (
      <Navigate
        replace
        to={`/register/${event.categoryId.festival}/${event.categoryId.slug}/${encodeURIComponent(event.title)}`}
      />
    );
  }
  return (
    <Guard requireComplete>
      <RegistrationAccess key={event._id} event={event} />
    </Guard>
  );
}
function RegistrationAccess({ event }) {
  const registrations = useResource("/registrations");
  if (registrations.loading)
    return <main className="ca-portal">Checking your registration…</main>;
  if (registrations.error) {
    return (
      <main className="ca-portal">
        <p role="alert" className="ca-error">
          {registrations.error}
        </p>
        <button onClick={registrations.reload}>Try again</button>
      </main>
    );
  }
  const existing = registrations.data?.registrations.find(
    (registration) => registration.eventId?._id === event._id,
  );
  if (existing) {
    return (
      <Navigate
        replace
        to="/portal"
        state={{
          tab: "registrations",
          focusRegistrationId: existing._id,
          alreadyRegisteredEvent: event.title,
        }}
      />
    );
  }
  if (!event.formPublished) return <Navigate to="/coming-soon" replace />;
  return <EventRegistration event={event} />;
}
function EventRegistration({ event }) {
  const id = event._id,
    teams = useResource("/teams"),
    { user } = usePortal();
  const location = useLocation();
  const navigate = useNavigate();
  const registrationOpen =
    event.status === "published" &&
    event.formPublished &&
    (!event.closesAt || new Date(event.closesAt).getTime() > Date.now()) &&
    (!event.opensAt || new Date(event.opensAt).getTime() <= Date.now());
  const [answers, setAnswers] = useState({}),
    [teamId, setTeamId] = useState(""),
    [error, setError] = useState(""),
    [receipt, setReceipt] = useState(null),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await portalApi.post(`/events/${id}/register`, {
        answers,
        teamId,
      });
      setReceipt(data.registration);
    } catch (e) {
      const detail = message(e);
      if (detail.includes("already registered")) {
        navigate("/portal", {
          replace: true,
          state: {
            tab: "registrations",
            alreadyRegisteredEvent: event.title,
          },
        });
      } else setError(detail);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main
      className="ca-portal ca-registration"
      data-festival={event.categoryId.festival}
    >
      <div className="ca-registration-content">
        <Link
          className="ca-registration-back"
          to={`/${event.categoryId.festival}/${event.categoryId.slug}`}
        >
          <span aria-hidden="true">←</span>
          Back to {event.categoryId.name}
        </Link>
        {event && (
          <>
            <header className="ca-heading ca-registration-heading">
              <div>
                <span className="ca-kicker">Event registration / 2026</span>
                <p>
                  {event.categoryId?.festival} / {event.categoryId?.name}
                </p>
                <h1>{event.title}</h1>
              </div>
              <span>
                {event.mode === "solo_or_team"
                  ? "Solo or team"
                  : event.mode === "team"
                    ? "Team"
                    : "Solo"}{" "}
                registration
              </span>
            </header>
            {(event.closesAt ||
              event.status !== "published" ||
              (event.opensAt &&
                new Date(event.opensAt).getTime() > Date.now())) && (
              <p className="ca-notice">
                {event.closesAt && (
                  <>
                    <strong>Registration closes:</strong>{" "}
                    {formatDeadline(event.closesAt)}
                  </>
                )}
                {event.status !== "published" &&
                  " New registration is currently closed."}
                {event.status === "published" &&
                  event.opensAt &&
                  new Date(event.opensAt).getTime() > Date.now() &&
                  ` Registration opens ${formatDeadline(event.opensAt)}.`}
                {event.status === "published" &&
                  event.closesAt &&
                  new Date(event.closesAt).getTime() <= Date.now() &&
                  " New registration is closed."}
              </p>
            )}
            <div className="ca-registration-form">
              <section className="ca-card">
                <h2>Register</h2>
                <fieldset>
                  <legend>Your participant details</legend>
                  <p>
                    These saved profile details are included automatically with
                    your registration.
                  </p>
                  <div className="ca-grid">
                    {[
                      ["caId", "CA ID"],
                      ["name", "Full name"],
                      ["email", "Email"],
                      ["registrationNumber", "College registration number"],
                      ["college", "College"],
                      ["course", "Course"],
                      ["year", "Year"],
                      ["branch", "Branch"],
                      ["phone", "Phone"],
                    ].map(([key, label]) => (
                      <label key={key}>
                        {label}
                        <input
                          readOnly
                          value={
                            key === "branch"
                              ? branchName(user.branch)
                              : user[key] || ""
                          }
                          placeholder="Complete your profile"
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>
                {receipt ? (
                  <div role="status">
                    <h3>Registration received</h3>
                    <p>
                      Registration ID: <strong>{receipt._id}</strong>
                    </p>
                    <Link
                      to="/portal"
                      state={{
                        tab: "registrations",
                        focusRegistrationId: receipt._id,
                      }}
                    >
                      View your registration
                    </Link>
                  </div>
                ) : !complete(user) ? (
                  <p>
                    <Link to="/portal" state={{ returnTo: location.pathname }}>
                      Complete your participant profile first →
                    </Link>
                  </p>
                ) : (
                  <form onSubmit={submit}>
                    <h3>Event registration details</h3>
                    {event.mode !== "solo" && (
                      <label>
                        Select a confirmed team you lead ({event.minTeamSize}–
                        {event.maxTeamSize} members)
                        <select
                          required={event.mode === "team"}
                          value={teamId}
                          onChange={(e) => setTeamId(e.target.value)}
                        >
                          <option value="">
                            {event.mode === "solo_or_team"
                              ? "Register individually"
                              : "Choose team"}
                          </option>
                          {teams.data?.teams
                            .filter((t) => t.leaderId === user._id)
                            .map((t) => (
                              <option
                                key={t._id}
                                value={t._id}
                                disabled={!!t.pendingIds.length}
                              >
                                {t.name} ({t.memberIds.length} members
                                {t.pendingIds.length
                                  ? ", invitations pending"
                                  : ""}
                                )
                              </option>
                            ))}
                        </select>
                        <small>
                          Create and manage teams from your dashboard.
                        </small>
                      </label>
                    )}
                    <FormFields
                      fields={event.fields}
                      answers={answers}
                      setAnswers={setAnswers}
                    />
                    <button disabled={busy || !registrationOpen}>
                      {busy ? "Submitting…" : "Submit registration"}
                    </button>
                    {error && (
                      <p className="ca-error" role="alert">
                        {error}
                      </p>
                    )}
                  </form>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
function Registrations({ focusRegistrationId, alreadyRegisteredEvent }) {
  const resource = useResource("/registrations"),
    { user } = usePortal(),
    [editing, setEditing] = useState(null),
    [answers, setAnswers] = useState({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (resource.loading || !focusRegistrationId) return;
    const target = document.getElementById(
      `participant-registration-${focusRegistrationId}`,
    );
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusRegistrationId, resource.loading]);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await portalApi.patch(`/registrations/${editing._id}`, {
        answers,
        revision: editing.revision,
      });
      setEditing(null);
      await resource.reload();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  function canReviewUpdate(registration) {
    return (
      registration.formUpdateNeeded &&
      registration.submittedBy === user._id &&
      ["published", "closed"].includes(registration.eventId?.status) &&
      registration.formUpdateDeadline &&
      new Date(registration.formUpdateDeadline).getTime() > Date.now()
    );
  }
  function beginEdit(registration) {
    setEditing(registration);
    setAnswers(
      registration.formUpdateNeeded
        ? registration.formUpdateAnswers
        : registration.answers,
    );
    setError("");
  }
  return (
    <section>
      <div className="ca-heading">
        <h2>Registered events</h2>
        <button className="ca-secondary" onClick={resource.reload}>
          Refresh
        </button>
      </div>
      {alreadyRegisteredEvent && (
        <p className="ca-notice" role="status">
          <strong>Already registered:</strong> Your registration for{" "}
          {alreadyRegisteredEvent} is shown below.
        </p>
      )}
      {(error || resource.error) && (
        <p role="alert" className="ca-error">
          {error || resource.error}
        </p>
      )}
      {resource.loading && <p>Loading registrations…</p>}
      {resource.data && !resource.data.registrations.length && (
        <p>You have no registrations yet.</p>
      )}
      {resource.data?.registrations.map((r) => (
        <article
          id={`participant-registration-${r._id}`}
          className="ca-card ca-registration-entry"
          data-focused={r._id === focusRegistrationId || undefined}
          key={r._id}
        >
          <h3>{r.eventId?.title || "Archived event"}</h3>
          <p>
            Registration ID: {r._id}
            <br />
            Status: <strong>Submitted</strong>
            {r.teamName && (
              <>
                <br />
                Team: {r.teamName}
              </>
            )}
          </p>
          {r.formUpdateNeeded && (
            <div className="ca-notice" role="status">
              <strong>
                {r.eventId?.title || "This event"} form has been updated.
              </strong>
              {r.formUpdateDeadline &&
              new Date(r.formUpdateDeadline).getTime() <= Date.now() ? (
                <p>
                  The update deadline has passed. Your original submission
                  remains recorded.
                </p>
              ) : (
                <>
                  <p>Please review and submit your updated answers.</p>
                  {r.formUpdateDeadline && (
                    <p>
                      <strong>Submit updated answers by:</strong>{" "}
                      {formatDeadline(r.formUpdateDeadline)}
                    </p>
                  )}
                </>
              )}
              {r.teamName && r.submittedBy !== user._id && (
                <p>Only the team leader can submit this updated form.</p>
              )}
            </div>
          )}
          <p>
            Members:{" "}
            {r.participants.map((p) => `${p.name} (${p.caId})`).join(", ")}
          </p>
          {editing?._id === r._id ? (
            <form onSubmit={save}>
              {r.formUpdateNeeded && (
                <p>
                  Answers to unchanged questions are filled in. New or changed
                  questions need fresh answers.
                </p>
              )}
              <FormFields
                fields={r.formUpdateNeeded ? r.formUpdateFields : r.fields}
                answers={answers}
                setAnswers={setAnswers}
              />
              <div className="ca-toolbar">
                <button disabled={busy}>
                  {r.formUpdateNeeded ? "Submit updated form" : "Save changes"}
                </button>
                <button
                  type="button"
                  className="ca-secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <AnswerView fields={r.fields} answers={r.answers} />
              {canReviewUpdate(r) ? (
                <button onClick={() => beginEdit(r)}>
                  Review updated form
                </button>
              ) : (
                !r.formUpdateNeeded &&
                r.submittedBy === user._id &&
                (r.canCorrectUpdatedResponse ||
                  (r.eventId?.allowEdits &&
                    r.eventId?.status === "published" &&
                    (!r.eventId?.closesAt ||
                      new Date(r.eventId.closesAt).getTime() >
                        Date.now()))) && (
                  <button onClick={() => beginEdit(r)}>
                    {r.canCorrectUpdatedResponse
                      ? "Edit updated answers"
                      : "Edit answers"}
                  </button>
                )
              )}
              {!!r.answerHistory?.length && (
                <details>
                  <summary>Earlier form responses</summary>
                  {r.answerHistory.map((entry, index) => (
                    <div key={`${entry.formVersion}-${index}`}>
                      <p>Form version {entry.formVersion}</p>
                      <AnswerView
                        fields={entry.fields}
                        answers={entry.answers}
                      />
                    </div>
                  ))}
                </details>
              )}
            </>
          )}
        </article>
      ))}
    </section>
  );
}
