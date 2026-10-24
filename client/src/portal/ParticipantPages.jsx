import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
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
import { useTeams } from "./useTeams";
import { FormFields, AnswerView } from "./FormFields";
import { courses, courseYears, branches, branchName } from "./profileOptions";
import {
  PortalLoading,
  DataLoading,
  DataLoadingPage,
  TeamsSkeleton,
  RegistrationsSkeleton,
} from "./PortalLoading";
import AvishkarBG from "../assets/common/backgrounds/AvishkarBG.webp";
import CulravBG from "../assets/common/backgrounds/CulravBG.webp";
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
  if (loading)
    return <PortalLoading label="Opening your participant archive" />;
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
    <Navigate
      to="/login"
      state={{
        returnTo: `${location.pathname}${location.search}${location.hash}`,
      }}
      replace
    />
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
    if (
      !location.state?.focusRegistrationId &&
      !location.state?.alreadyRegisteredEvent
    )
      return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);
  return (
    <main className="ca-portal ca-participant" data-active-tab={tab}>
      {error && (
        <p className="ca-error" role="alert">
          {error}
        </p>
      )}
      <header className="ca-heading ca-workspace-heading">
        <div className="ca-workspace-identity">
          <div className="ca-workspace-copy">
            <span className="ca-kicker">Citizen of the two realms · 2026</span>
            <p>{user.caId}</p>
            <h1>Welcome, {user.name}</h1>
          </div>
        </div>
        <button
          className="ca-secondary"
          onClick={() => logout().catch((e) => setError(message(e)))}
        >
          Sign out
        </button>
      </header>
      <nav
        className="ca-tabs ca-archive-tabs w-full grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8"
        style={{ "--archive-tab-count": 3 }}
      >
        {[
          ["profile", "I", "Profile", "Profile"],
          ["registrations", "II", "Registered Events", "Events"],
          ["teams", "III", "Teams", "Teams"],
        ].map(([key, numeral, label, mobileLabel]) => {
          const isActive = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={isActive}
              className={`group relative flex items-center justify-center gap-1.5 sm:gap-2.5 px-2 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 cursor-pointer overflow-hidden border-0 border-b-2 text-center select-none outline-none focus:outline-none focus-visible:outline-none ${
                isActive
                  ? "border-transparent border-b-[#95521e] bg-gradient-to-b from-transparent to-[#975720]/15 text-[#3d2110]"
                  : "border-transparent border-b-[#6f421d]/30 text-[#654329] hover:text-[#3f2413] hover:border-b-[#94531f] hover:bg-[#fff5d8]/40"
              }`}
            >
              <span
                aria-hidden="true"
                className={`ca-tab-numeral hidden sm:grid w-5 h-5 sm:w-6 sm:h-6 shrink-0 place-items-center rounded-full text-[9px] sm:text-[10px] font-cinzel font-bold border ${
                  isActive
                    ? "border-[#94531f] bg-[#96541d]/15 text-[#5a3015] shadow-xs"
                    : "border-[#d1a05b]/60 text-[#8a5429]"
                }`}
              >
                {numeral}
              </span>
              <span className="ca-tab-label font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
                <span className="ca-tab-label-desktop hidden md:inline">{label}</span>
                <span className="ca-tab-label-mobile md:hidden">{mobileLabel}</span>
              </span>
            </button>
          );
        })}
      </nav>
      <section className="ca-tab-panel" key={tab}>
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
      </section>
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

  useEffect(() => {
    if (!pendingProfile) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busy) {
        setPendingProfile(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pendingProfile, busy]);

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
      {pendingProfile &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="ca-participant">
            <div
              className="ca-profile-confirm-backdrop"
              role="presentation"
              onClick={(event) => {
                if (event.target === event.currentTarget && !busy) {
                  setPendingProfile(null);
                }
              }}
            >
              <div
                className="ca-profile-confirm ca-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ca-profile-confirm-title"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 id="ca-profile-confirm-title">Confirm your profile details</h3>
                <p className="ca-profile-confirm-note">
                  Check your details before saving. They cannot be edited afterward.
                </p>
                <dl className="ca-profile-confirm-grid">
                  {[
                    ["Name", pendingProfile.name],
                    ["Google email", user.email],
                    ["College", pendingProfile.college],
                    [
                      "College reg. no.",
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
                    <div key={label} className="ca-profile-confirm-item">
                      <dt title={label}>{label}</dt>
                      <dd title={value}>{value}</dd>
                    </div>
                  ))}
                </dl>
                <label className="ca-choice ca-profile-confirm-choice">
                  <input
                    type="checkbox"
                    autoFocus
                    checked={acknowledged}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                  />
                  <span>
                    I have checked these details and understand I cannot edit them after saving.
                  </span>
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
          </div>,
          document.body,
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
  const resource = useTeams(),
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
    <section className="ca-participant-panel ca-teams-panel">
      <div className="ca-panel-actions text-left" style={{ textAlign: "left", justifyContent: "space-between" }}>
        <p className="text-left text-start self-start" style={{ textAlign: "left", margin: 0 }}>
          Invite members using their CA IDs. Every member must accept before the
          leader registers. After a team is registered for an event, its roster
          is locked. Create another team if you need a different roster.
        </p>
        <button
          className="ca-secondary"
          disabled={busy || resource.refreshing}
          onClick={() => resource.reload().catch((e) => setError(message(e)))}
        >
          {resource.refreshing ? "Refreshing teams…" : "Refresh teams"}
        </button>
      </div>
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
      {resource.loading && <TeamsSkeleton />}
      <div className="ca-grid">
        {resource.data?.teams.map((t, index) => {
          const pending = t.pendingIds.some((p) => p._id === user._id),
            leader = t.leaderId === user._id;
          return (
            <article className="ca-card ca-team-record" key={t._id}>
              <div className="ca-record-title">
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <small>Team record</small>
                  <h3>{t.name}</h3>
                </div>
              </div>
              {t.locked && (
                <p className="ca-record-status">
                  Roster sealed after registration
                </p>
              )}
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
                <div className="ca-team-body">
                  <div className="ca-team-members-section">
                    <p className="ca-team-subheading">Team Roster</p>
                    <ul className="ca-team-members-list">
                      {t.memberIds.map((p) => (
                        <li key={p._id} className="ca-team-member-item">
                          <span className="ca-team-member-info">
                            <strong className="ca-team-member-name">{p.name}</strong>
                            <span className="ca-team-caid">{p.caId}</span>
                            {p._id === t.leaderId && (
                              <span className="ca-team-leader-badge">Leader</span>
                            )}
                          </span>
                          {(leader || p._id === user._id) && p._id !== t.leaderId && (
                            <button
                              className="ca-inline ca-team-remove-btn"
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
                  </div>

                  {t.pendingIds.length > 0 && (
                    <div className="ca-team-pending-section">
                      <p className="ca-team-subheading">Pending Invitations</p>
                      <ul className="ca-team-members-list">
                        {t.pendingIds.map((p) => (
                          <li key={p._id} className="ca-team-member-item ca-team-pending-item">
                            <span className="ca-team-member-info">
                              <span className="ca-team-member-name">{p.name}</span>
                              <span className="ca-team-caid">{p.caId}</span>
                            </span>
                            {leader && (
                              <button
                                className="ca-inline ca-team-remove-btn"
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
                    </div>
                  )}

                  {leader && !t.locked && (
                    <form
                      className="ca-team-invite-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const input = form.elements.namedItem("caId");
                        action(`/teams/${t._id}/invite`, {
                          caId: input.value,
                        }).then(() => {
                          form.reset();
                        });
                      }}
                    >
                      <label className="ca-team-invite-label">
                        <span>Invite by CA ID</span>
                        <div className="ca-team-invite-row">
                          <input
                            name="caId"
                            placeholder="CA-2026-000001"
                            required
                          />
                          <button type="submit" disabled={busy || t.locked}>
                            Invite
                          </button>
                        </div>
                      </label>
                    </form>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
export function RegistrationPage({
  eventId,
  eventData = null,
  registrationData,
  teamsData,
}) {
  return (
    <Guard requireComplete>
      <RegistrationPageContent
        eventId={eventId}
        eventData={eventData}
        registrationData={registrationData}
        teamsData={teamsData}
      />
    </Guard>
  );
}

function RegistrationPageContent({
  eventId,
  eventData = null,
  registrationData,
  teamsData,
}) {
  const { id } = useParams();
  const resource = useResource(eventData ? null : `/events/${eventId || id}`);
  if (!eventData && resource.loading)
    return <DataLoadingPage label="Preparing event registration" />;
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
  if (!event) return <Navigate to="/coming-soon" replace />;
  if (!eventData && !eventId && event.categoryId?.slug) {
    return (
      <Navigate
        replace
        to={`/register/${event.categoryId.festival}/${event.categoryId.slug}/${encodeURIComponent(event.title)}`}
      />
    );
  }
  return (
    <RegistrationAccess
      key={event._id}
      event={event}
      registrationData={registrationData}
      teamsData={teamsData}
    />
  );
}
function RegistrationAccess({ event, registrationData, teamsData }) {
  const registrations = useResource(
    registrationData === undefined ? `/events/${event._id}/my-registration` : null,
  );
  if (registrations.loading)
    return (
      <DataLoadingPage
        label="Preparing your registration"
        festival={event.categoryId?.festival}
      />
    );
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
  const existing =
    registrationData === undefined
      ? registrations.data?.registration
      : registrationData;
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
  if (!event.formPublished) {
    return (
      <Navigate
        to="/coming-soon"
        replace
        state={{ eventTitle: event?.title, festival: event?.categoryId?.festival }}
      />
    );
  }
  return <EventRegistration event={event} teamsData={teamsData} />;
}
function EventRegistration({ event, teamsData }) {
  const id = event._id,
    loadedTeams = useTeams(event.mode !== "solo" && teamsData === undefined),
    { user } = usePortal();
  const teams =
    teamsData === undefined ? loadedTeams : { data: { teams: teamsData }, loading: false };
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
  const isCulrav = event?.categoryId?.festival === "culrav";
  const bgImage = isCulrav ? CulravBG : AvishkarBG;

  return (
    <main
      className="ca-portal ca-registration min-h-screen w-full relative text-[#241104] overflow-x-hidden font-sans select-none"
      data-festival={event.categoryId.festival}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Gentle Olympian atmospheric veil - bright, warm, classical sunlit glow */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#3b1e0d]/42 via-[#6f3918]/18 to-[#2b1509]/34 z-0" />

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-28">
        {/* Back Link */}
        <Link
          className="ca-registration-back inline-flex items-center gap-2.5 px-4 py-2 border-2 border-[#b88c4b] hover:border-[#8c521f] bg-[#fffdf8]/95 hover:bg-[#faebd0] text-[#4d260f] hover:text-[#241104] font-cinzel text-xs font-bold uppercase tracking-[0.18em] transition-all duration-200 shadow-sm mb-8 group rounded-xs"
          to={`/${event.categoryId.festival}/${event.categoryId.slug}`}
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1 text-sm text-[#8c521f]">←</span>
          <span>Back to {event.categoryId.name}</span>
        </Link>

        {event && (
          <>
            {/* Masthead Header (Open & Grand - Classical Olympian Hierarchy) */}
            <header className="ca-registration-masthead text-center max-w-4xl mx-auto mb-10 sm:mb-12">
              <span className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#8c521f] block mb-1">
                ✦ {event.categoryId?.festival} / {event.categoryId?.name} ✦
              </span>

              <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[0.14em] text-[#241104] my-3 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                {event.title}
              </h1>

              {/* Classical Laurel Divider */}
              <div className="flex items-center justify-center gap-3 mt-3 mb-4 text-[#b88c4b]">
                <div className="h-px w-20 sm:w-36 bg-gradient-to-r from-transparent via-[#b88c4b] to-[#b88c4b]" />
                <span className="text-xs text-[#a06a28]">✦</span>
                <div className="h-px w-20 sm:w-36 bg-gradient-to-l from-transparent via-[#b88c4b] to-[#b88c4b]" />
              </div>

              {/* Registration Mode Badge */}
              <div className="ca-registration-mode inline-flex items-center gap-2 px-4 py-1.5 border border-[#b88c4b] bg-[#fffdf8]/95 text-[#633512] font-cinzel text-xs font-bold uppercase tracking-[0.18em] shadow-sm rounded-xs">
                <span>✦</span>
                <span>
                  {event.mode === "solo_or_team"
                    ? "Solo or Team Registration"
                    : event.mode === "team"
                      ? `Team Registration (${event.minTeamSize}–${event.maxTeamSize} Members)`
                      : "Solo Registration"}
                </span>
                <span>✦</span>
              </div>
            </header>

            {/* Registration Notice / Status Banner */}
            {(event.closesAt ||
              event.status !== "published" ||
              (event.opensAt &&
                new Date(event.opensAt).getTime() > Date.now())) && (
              <div className="ca-registration-notice max-w-4xl mx-auto mb-8 p-4 border-2 border-[#b88c4b] bg-[#fbf2df]/95 text-[#3e2311] font-garamond text-base sm:text-lg flex items-center gap-3 shadow-sm rounded-xs">
                <span className="text-[#a06a28] text-lg">✦</span>
                <div>
                  {event.closesAt && (
                    <span className="font-cinzel font-bold text-sm tracking-wider text-[#7a3e10] mr-2">
                      REGISTRATION CLOSES: {formatDeadline(event.closesAt)}
                    </span>
                  )}
                  {event.status !== "published" && " New registration is currently closed."}
                  {event.status === "published" &&
                    event.opensAt &&
                    new Date(event.opensAt).getTime() > Date.now() &&
                    ` Registration opens ${formatDeadline(event.opensAt)}.`}
                  {event.status === "published" &&
                    event.closesAt &&
                    new Date(event.closesAt).getTime() <= Date.now() &&
                    " New registration is closed."}
                </div>
              </div>
            )}

            {/* The Main Majestic Tablet (Light + High Contrast Hellenic Cartouche) */}
            <div className="ca-registration-form max-w-4xl mx-auto">
              <section
                className="
                  ca-registration-tablet relative p-6 sm:p-10 lg:p-12
                  border-2 border-[#b88c4b]
                  bg-gradient-to-b from-[#fffdfa] via-[#fbf3e4] to-[#f5e6c8]
                  shadow-[0_24px_70px_rgba(50,25,8,0.2),0_4px_18px_rgba(50,25,8,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)]
                  rounded-xs
                "
                style={{
                  backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.92) 0%, rgba(251, 243, 228, 0.95) 55%, rgba(245, 230, 200, 0.97) 100%), url('/media/common/textures/parchment-bg.webp')",
                  backgroundSize: "cover",
                }}
              >
                {/* Classical Inner Inset Fillet Border */}
                <div className="pointer-events-none absolute inset-2.5 sm:inset-3 border border-[#b88c4b]/35" />

                {/* Classical Corner Stars */}
                <div className="pointer-events-none absolute top-3 sm:top-4 left-3 sm:left-4 text-xs text-[#a06a28]">✦</div>
                <div className="pointer-events-none absolute top-3 sm:top-4 right-3 sm:right-4 text-xs text-[#a06a28]">✦</div>
                <div className="pointer-events-none absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-xs text-[#a06a28]">✦</div>
                <div className="pointer-events-none absolute bottom-3 sm:bottom-4 right-3 sm:right-4 text-xs text-[#a06a28]">✦</div>

                {/* Section 1: Participant Profile (Open, Modern Editorial Layout - Light + Contrast) */}
                <div className="relative z-10 mb-8">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-[#a06a28] text-sm">✦</span>
                    <h2 className="font-cinzel text-xl sm:text-2xl font-black uppercase tracking-[0.16em] text-[#241104]">
                      Participant Profile
                    </h2>
                  </div>
                  <p className="font-garamond italic text-sm sm:text-base text-[#6b421d] mb-6">
                    These saved profile details are linked automatically to your event registration.
                  </p>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                    {[
                      ["caId", "CA ID"],
                      ["name", "Full Name"],
                      ["email", "Email Address", "col-span-2 lg:col-span-1"],
                      ["registrationNumber", "College Reg. Number"],
                      ["college", "College"],
                      ["course", "Course"],
                      ["year", "Year"],
                      ["branch", "Branch"],
                      ["phone", "Phone Number"],
                    ].map(([key, label, spanClass]) => (
                      <div
                        key={key}
                        className={`ca-registration-profile-field flex flex-col gap-0.5 sm:gap-1 p-2.5 sm:p-3 bg-gradient-to-br from-[#ffffff] via-[#fffdf9] to-[#faf1df] border border-[#b88c4b]/50 rounded-xs shadow-[0_2px_6px_rgba(70,35,10,0.05)] overflow-hidden ${
                          spanClass || ""
                        }`}
                      >
                        <span className="font-cinzel text-[9.5px] sm:text-[11px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.14em] text-[#854d1d] truncate">
                          {label}
                        </span>
                        <span className="font-garamond text-sm sm:text-lg text-[#1f1006] font-bold truncate">
                          {key === "branch"
                            ? branchName(user.branch) || "—"
                            : user[key] || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Classical Laurel Divider between Profile & Form */}
                <div className="relative z-10 flex items-center justify-center gap-3 my-8 text-[#b88c4b]">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#b88c4b]/50 to-[#b88c4b]/50" />
                  <span className="text-xs text-[#a06a28]">✦</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#b88c4b]/50 to-[#b88c4b]/50" />
                </div>

                {/* Section 2: Registration Submission or Status */}
                <div className="relative z-10">
                  {receipt ? (
                    <div
                      role="status"
                      className="ca-registration-state text-center p-8 border-2 border-[#b88c4b] bg-[#fffdf8] shadow-[0_6px_20px_rgba(70,35,10,0.08)] rounded-xs"
                    >
                      <span className="text-2xl text-[#a06a28] block mb-2">✦</span>
                      <h3 className="font-cinzel text-2xl sm:text-3xl font-black uppercase tracking-[0.16em] text-[#241104] mb-3">
                        Registration Received
                      </h3>
                      <p className="font-garamond text-lg text-[#4a2711] mb-6">
                        Registration ID: <strong className="font-mono text-[#8c521f] font-bold tracking-wider">{receipt._id}</strong>
                      </p>
                      <Link
                        to="/portal"
                        state={{
                          tab: "registrations",
                          focusRegistrationId: receipt._id,
                        }}
                        className={`
                          ca-registration-action inline-flex items-center gap-2 px-8 py-3.5
                          border-2 ${isCulrav ? "border-[#dfa255] bg-[#992510] hover:bg-[#b52f15]" : "border-[#8e4873] bg-[#471E39] hover:bg-[#5e274b]"}
                          text-[#fffef8] font-cinzel font-black uppercase tracking-[0.2em] text-sm
                          hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg rounded-xs
                        `}
                      >
                        View Your Registration ➔
                      </Link>
                    </div>
                  ) : !complete(user) ? (
                    <div className="ca-registration-state text-center p-8 border-2 border-[#b88c4b] bg-[#fffdf8] shadow-[0_6px_20px_rgba(70,35,10,0.08)] rounded-xs">
                      <span className="text-xl text-[#a06a28] block mb-2">✦</span>
                      <p className="font-garamond text-lg text-[#3e2311] mb-5">
                        Please complete your participant profile before registering for events.
                      </p>
                      <Link
                        to="/portal"
                        state={{ returnTo: location.pathname }}
                        className={`
                          ca-registration-action inline-flex items-center gap-2 px-8 py-3.5
                          border-2 ${isCulrav ? "border-[#dfa255] bg-[#992510] hover:bg-[#b52f15]" : "border-[#8e4873] bg-[#471E39] hover:bg-[#5e274b]"}
                          text-[#fffef8] font-cinzel font-black uppercase tracking-[0.2em] text-sm
                          hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg rounded-xs
                        `}
                      >
                        Complete Profile First ➔
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={submit} className="ca-registration-fields flex flex-col gap-6">
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-[#a06a28] text-sm">✦</span>
                        <h3 className="font-cinzel text-xl sm:text-2xl font-black uppercase tracking-[0.16em] text-[#241104]">
                          Event Registration Details
                        </h3>
                      </div>

                      {event.mode !== "solo" && teams.loading && (
                        <DataLoading label="Loading your teams" compact />
                      )}

                      {event.mode !== "solo" && (
                        <div className="flex flex-col gap-2">
                          <label className="font-cinzel text-xs font-bold uppercase tracking-[0.14em] text-[#6b3810]">
                            Select a Confirmed Team You Lead ({event.minTeamSize}–{event.maxTeamSize} Members)
                          </label>
                          <select
                            required={event.mode === "team"}
                            value={teamId}
                            onChange={(e) => setTeamId(e.target.value)}
                            className="w-full px-4 py-3 bg-[#ffffff] border-2 border-[#b88c4b]/70 focus:border-[#a85820] text-[#241104] font-garamond text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#c99852]/30 shadow-[inset_0_1px_3px_rgba(70,35,10,0.06)] rounded-xs transition-all"
                          >
                            <option value="" className="bg-[#ffffff] text-[#241104]">
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
                                  className="bg-[#ffffff] text-[#241104]"
                                >
                                  {t.name} ({t.memberIds.length} members
                                  {t.pendingIds.length
                                    ? ", invitations pending"
                                    : ""}
                                  )
                                </option>
                              ))}
                          </select>
                          <small className="font-garamond italic text-sm text-[#7a461b]">
                            Create and manage teams from your dashboard.
                          </small>
                        </div>
                      )}

                      <FormFields
                        fields={event.fields}
                        answers={answers}
                        setAnswers={setAnswers}
                      />

                      <button
                        type="submit"
                        disabled={busy || !registrationOpen}
                        className={`
                          ca-registration-submit w-full mt-6 py-4 px-8 border-2
                          ${
                            isCulrav
                              ? "border-[#dfa255] bg-[#992510] hover:bg-[#b52f15] shadow-[0_8px_24px_rgba(153,37,16,0.5),inset_0_1px_2px_rgba(255,245,215,0.4)]"
                              : "border-[#8e4873] bg-[#471E39] hover:bg-[#5e274b] shadow-[0_8px_24px_rgba(71,30,57,0.5),inset_0_1px_2px_rgba(245,215,235,0.4)]"
                          }
                          text-[#fffef8] font-cinzel font-black uppercase tracking-[0.24em] text-sm sm:text-base
                          hover:border-[#ffd977] hover:scale-[1.01] active:scale-[0.99]
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                          transition-all duration-200 cursor-pointer select-none rounded-xs
                        `}
                      >
                        {busy ? "Submitting to the Archives…" : "Submit Registration ➔"}
                      </button>

                      {error && (
                        <p className="ca-registration-error p-3.5 border-2 border-red-600/70 bg-red-50 text-red-900 font-cinzel text-xs font-bold tracking-wider text-center rounded-xs shadow-sm" role="alert">
                          {error}
                        </p>
                      )}
                    </form>
                  )}
                </div>
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
    <section className="ca-participant-panel ca-registrations-panel">
      <div className="ca-panel-actions">
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
      {resource.loading && <RegistrationsSkeleton />}
      {resource.data && !resource.data.registrations.length && (
        <p>You have no registrations yet.</p>
      )}
      {resource.data?.registrations.map((r, index) => (
        <article
          id={`participant-registration-${r._id}`}
          className="ca-card ca-registration-entry"
          data-focused={r._id === focusRegistrationId || undefined}
          key={r._id}
        >
          <div className="ca-record-title">
            <span aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <small>Event record</small>
              <h3>{r.eventId?.title || "Archived event"}</h3>
            </div>
          </div>
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
