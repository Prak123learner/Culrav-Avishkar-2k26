import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { portalApi, message } from "./api";
import { usePortal } from "./context";
import { useResource } from "./useResource";
import { ChangeStaffPassword } from "./AuthPages";
import { FormFields, AnswerView } from "./FormFields";
import { ChoiceOptionsEditor } from "./ChoiceOptionsEditor";
import { AuditLogs } from "./AuditLogs";
import {
  PortalLoading,
  DataLoading,
  CategoriesSkeleton,
  SubeventsSkeleton,
} from "./PortalLoading";
import "./portal.css";

const defaultLinkInstructions =
  "Make sure the file or URL can be opened by the event coordinators. For Google Drive, check its sharing permissions before submitting.";

export function CoordinatorHome({ adminOnly = false }) {
  const { staff, loading } = usePortal();
  if (loading) return <PortalLoading label="Restoring staff workspace" />;
  if (!staff)
    return (
      <Navigate
        to={adminOnly ? "/admin/login" : "/coordinator/login"}
        replace
      />
    );
  if (staff.role === "admin" && !adminOnly)
    return <Navigate to="/admin" replace />;
  if (staff.role !== "admin" && adminOnly)
    return <Navigate to="/coordinator" replace />;
  if (staff.mustChangePassword) return <ChangeStaffPassword />;
  return <StaffWorkspace />;
}
function StaffWorkspace() {
  const { staff } = usePortal(),
    [tab, setTab] = useState("events");
  const categories = useResource("/staff/categories");
  const tabs = [
    ["events", "I", "Events"],
    ["CA ID lookup", "II", "CA ID lookup"],
    ...(staff.role === "admin"
      ? [
          ["coordinators", "III", "Coordinators"],
          ["logs", "IV", "Audit logs"],
        ]
      : []),
  ];
  return (
    <main className="ca-portal ca-staff">
      <header className="ca-heading ca-workspace-heading">
        <div className="ca-staff-identity">
          <div className="ca-staff-heading-copy">
            <span className="ca-kicker">Festival operations · 2026</span>
            <p>
              {staff.caId} · {staff.email}
            </p>
            <h1>
              {staff.role === "admin"
                ? "Festival administration"
                : "Coordinator workspace"}
            </h1>
          </div>
        </div>
      </header>
      {categories.error && (
        <p className="ca-error" role="alert">
          {categories.error}
        </p>
      )}
      <nav
        className="ca-tabs ca-staff-tabs ca-archive-tabs"
        style={{ "--archive-tab-count": tabs.length }}
      >
        {tabs.map(([key, numeral, label]) => (
          <button
            key={key}
            className="ca-tab-button"
            onClick={() => setTab(key)}
            aria-pressed={key === tab}
          >
            <span className="ca-tab-numeral" aria-hidden="true">
              {numeral}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <section className="ca-tab-panel" key={tab}>
        {categories.loading ? (
          <CategoriesSkeleton />
        ) : tab === "events" ? (
          <ManageEvents categories={categories.data?.categories || []} />
        ) : tab === "CA ID lookup" ? (
          <ParticipantLookup staff={staff} />
        ) : tab === "logs" && staff.role === "admin" ? (
          <AuditLogs />
        ) : (
          <Coordinators categories={categories.data?.categories || []} />
        )}
      </section>
    </main>
  );
}
function ParticipantLookup({ staff }) {
  const [query, setQuery] = useState(""),
    [matches, setMatches] = useState([]),
    [more, setMore] = useState(false),
    [result, setResult] = useState(null),
    [searched, setSearched] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function openParticipant(id) {
    const { data } = await portalApi.get(
      `/staff/participants/${id}/registrations`,
    );
    setResult(data);
  }
  async function search(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    setSearched(false);
    try {
      const { data } = await portalApi.get("/staff/participants/lookup", {
        params: { q: query.trim() },
      });
      setMatches(data.matches);
      setMore(data.more);
      setSearched(true);
      if (data.matches.length === 1) await openParticipant(data.matches[0]._id);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function select(id) {
    setBusy(true);
    setError("");
    try {
      await openParticipant(id);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  const p = result?.participant;
  return (
    <section>
      <h2>Find participant by CA ID</h2>
      <p>
        Enter a complete CA ID or its last digits. You can view any
        participant’s basic profile.{" "}
        {staff.role === "admin"
          ? "All their event registrations are shown."
          : "Only registrations in your assigned categories are shown."}
      </p>
      <form className="ca-card ca-toolbar" onSubmit={search}>
        <label>
          CA ID or last digits
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="CA-2026-123456 or 123456"
            required
            maxLength={30}
          />
        </label>
        <button disabled={busy}>{busy ? "Searching…" : "Search"}</button>
      </form>
      {error && (
        <p className="ca-error" role="alert">
          {error}
        </p>
      )}
      {searched && !matches.length && <p>No participant found.</p>}
      {more && <p>Many IDs match. Enter more digits to narrow the search.</p>}
      {matches.length > 1 && (
        <div className="ca-grid">
          {matches.map((match) => (
            <button
              key={match._id}
              className="ca-secondary"
              disabled={busy}
              onClick={() => select(match._id)}
            >
              {match.caId} · {match.name} · {match.college}
            </button>
          ))}
        </div>
      )}
      {p && (
        <>
          <article className="ca-card">
            <h3>
              {p.name} · {p.caId}
            </h3>
            <div className="ca-grid">
              {[
                ["Email", p.email],
                ["College", p.college],
                ["College registration number", p.registrationNumber],
                ["Course", p.course],
                ["Year", p.year],
                ["Branch", p.branch],
                ["Phone", p.phone],
              ].map(([label, value]) => (
                <p key={label}>
                  <strong>{label}:</strong> {value || "—"}
                </p>
              ))}
            </div>
          </article>
          <h3>Registered events</h3>
          {!result.registrations.length && (
            <p>
              {staff.role === "admin"
                ? "No registrations found."
                : "No registrations in your assigned categories."}
            </p>
          )}
          <div className="ca-grid">
            {result.registrations.map((registration) => (
              <article className="ca-card" key={registration._id}>
                <h4>{registration.eventId?.title || "Archived event"}</h4>
                <p>
                  {registration.eventId?.categoryId?.festival} /{" "}
                  {registration.eventId?.categoryId?.name}
                </p>
                <p>{registration.teamName || "Solo"} · Submitted</p>
                <small>
                  {new Date(registration.createdAt).toLocaleString()}
                </small>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
function Coordinators({ categories }) {
  const resource = useResource("/staff/coordinators"),
    [selected, setSelected] = useState([]),
    [email, setEmail] = useState(""),
    [name, setName] = useState(""),
    [notice, setNotice] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function mutate(path, body, method = "post") {
    setBusy(true);
    setError("");
    setNotice(null);
    try {
      const { data } = await portalApi[method](path, body);
      setNotice(data);
      await resource.reload();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>Coordinator access</h2>
      <p>
        Every coordinator has their own account. Assigning an existing email
        changes category access without changing their password.
      </p>
      <form
        className="ca-card ca-form"
        onSubmit={(e) => {
          e.preventDefault();
          mutate("/staff/coordinators", { email, name, categoryIds: selected });
        }}
      >
        <label>
          Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <fieldset>
          <legend>Assigned categories</legend>
          <div className="ca-grid">
            {categories
              .filter((c) => !c.archived)
              .map((c) => (
                <label className="ca-choice" key={c._id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(c._id)}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, c._id]
                          : selected.filter((id) => id !== c._id),
                      )
                    }
                  />
                  {c.festival} / {c.name}
                </label>
              ))}
          </div>
        </fieldset>
        <button disabled={busy || !selected.length}>
          Grant / update access
        </button>
      </form>
      {notice && (
        <div className="ca-notice" role="status">
          <p>{notice.delivery}</p>
          {notice.temporaryPassword && (
            <>
              <p>Temporary password (save securely now):</p>
              <code>{notice.temporaryPassword}</code>
              <p>Expires in 72 hours. It must be replaced on first login.</p>
            </>
          )}
          <button onClick={() => setNotice(null)}>Dismiss credentials</button>
        </div>
      )}
      {(error || resource.error) && (
        <p className="ca-error" role="alert">
          {error || resource.error}
        </p>
      )}
      <div className="ca-grid">
        {resource.data?.staff.map((s) => (
          <article className="ca-card" key={s._id}>
            <h3>{s.name}</h3>
            <p>
              {s.email}
              <br />
              {s.caId} · {s.active ? "Active" : "Revoked"}
            </p>
            <p>
              {s.categoryIds
                .map((id) => categories.find((c) => c._id === id)?.name || id)
                .join(", ")}
            </p>
            <div className="ca-toolbar">
              <button
                className="ca-secondary"
                onClick={() => {
                  setName(s.name);
                  setEmail(s.email);
                  setSelected(s.categoryIds);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Edit assignments
              </button>
              <button
                disabled={busy}
                className="ca-secondary"
                onClick={() =>
                  mutate(
                    `/staff/coordinators/${s._id}`,
                    { active: !s.active },
                    "patch",
                  )
                }
              >
                {s.active ? "Revoke access" : "Restore access"}
              </button>
              <button
                disabled={busy}
                className="ca-secondary"
                onClick={() => {
                  if (
                    window.confirm(
                      `Reset ${s.email}'s password and invalidate their sessions?`,
                    )
                  )
                    mutate(
                      `/staff/coordinators/${s._id}`,
                      { resetPassword: true },
                      "patch",
                    );
                }}
              >
                Reset password
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function ManageEvents({ categories }) {
  const resource = useResource("/staff/events"),
    [editing, setEditing] = useState(null),
    [review, setReview] = useState(null),
    [reviewCategory, setReviewCategory] = useState(null),
    [search, setSearch] = useState("");
  const [selection, setSelection] = useSearchParams();
  const festival = selection.get("festival") || "";
  const categoryId = selection.get("category") || "";
  const query = search.trim().toLowerCase();
  const events = resource.data?.events || [];
  const matches = (value) => value.toLowerCase().includes(query);
  const matchingCategories = query
    ? categories.filter((category) => matches(category.name))
    : categories.filter((category) => category.festival === festival);
  const visibleEvents = query
    ? events.filter(
        (event) =>
          matches(event.title) || matches(event.categoryId?.name || ""),
      )
    : events.filter((event) => event.categoryId?._id === categoryId);
  function openCategory(category) {
    setSelection({ festival: category.festival, category: category._id });
    setSearch("");
  }
  if (editing)
    return (
      <EventEditor
        key={editing._id}
        event={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          await resource.reload();
        }}
      />
    );
  if (review)
    return <ResponseReview event={review} onClose={() => setReview(null)} />;
  if (reviewCategory)
    return (
      <ResponseReview
        category={reviewCategory}
        events={events.filter(
          (event) => event.categoryId?._id === reviewCategory._id,
        )}
        onClose={() => setReviewCategory(null)}
      />
    );
  if (resource.loading)
    return (
      <section className="ca-realm-directory" aria-busy="true">
        <h2>Festival events</h2>
        <p>
          Existing event names, categories, descriptions, rules and public
          contacts are maintained in the static event catalog. Manage
          participation settings and registration forms here.
        </p>
        <SubeventsSkeleton />
      </section>
    );
  return (
    <section className="ca-realm-directory">
      <h2>Festival events</h2>
      <p>
        Existing event names, categories, descriptions, rules and public
        contacts are maintained in the static event catalog. Manage
        participation settings and registration forms here.
      </p>
      {!categories.length && (
        <p>No categories assigned yet. Ask your admin for access.</p>
      )}
      {resource.error && (
        <p className="ca-error" role="alert">
          {resource.error}
        </p>
      )}
      <label className="ca-event-search">
        Search events or categories
        <input
          type="search"
          placeholder="Picture Tale, Darkroom, Cyberquest…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <nav className="ca-event-breadcrumb" aria-label="Event navigation">
        <button
          className="ca-secondary"
          onClick={() => {
            setSelection({});
            setSearch("");
          }}
        >
          Festivals
        </button>
        {festival && (
          <>
            <span>/</span>
            <button
              className="ca-secondary"
              onClick={() => {
                setSelection({ festival });
                setSearch("");
              }}
            >
              {festival === "avishkar" ? "Avishkar" : "Culrav"}
            </button>
          </>
        )}
        {categoryId && (
          <>
            <span>/</span>
            <span>
              {categories.find((category) => category._id === categoryId)?.name}
            </span>
          </>
        )}
      </nav>
      {!query && !festival && (
        <div className="ca-grid">
          {["avishkar", "culrav"].map((name, index) => (
            <button
              className="ca-festival-tile"
              data-festival={name}
              key={name}
              onClick={() => setSelection({ festival: name })}
            >
              <span className="ca-realm-order" aria-hidden="true">
                {index === 0 ? "I" : "II"}
              </span>
              <span className="ca-realm-copy">
                <small>
                  {name === "avishkar"
                    ? "Technical festival"
                    : "Cultural festival"}
                </small>
                <strong>{name === "avishkar" ? "Avishkar" : "Culrav"}</strong>
                <span className="ca-realm-divider" aria-hidden="true" />
                <span className="ca-realm-count">
                  {
                    categories.filter(
                      (category) => category.festival === name,
                    ).length
                  }{" "}
                  categories
                </span>
              </span>
              <span className="ca-realm-enter">
                Enter realm <span aria-hidden="true">→</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {(query || (festival && !categoryId)) && (
        <>
          <h3>{query ? "Matching categories" : "Categories"}</h3>
          <div className="ca-grid">
            {matchingCategories.map((category) => (
              <button
                className="ca-category-tile"
                data-festival={category.festival}
                key={category._id}
                onClick={() => openCategory(category)}
              >
                <small>{category.festival}</small>
                <strong>{category.name}</strong>
                <span>
                  {
                    events.filter(
                      (event) => event.categoryId?._id === category._id,
                    ).length
                  }{" "}
                  events →
                </span>
              </button>
            ))}
          </div>
          {!matchingCategories.length && <p>No matching categories.</p>}
        </>
      )}
      {categoryId && !query && (
        <div className="ca-toolbar">
          <button
            onClick={() =>
              setReviewCategory(
                categories.find((category) => category._id === categoryId),
              )
            }
          >
            View category responses
          </button>
        </div>
      )}
      {query && <h3>Matching events</h3>}
      {(query || categoryId) && (
        <>
          <div className="ca-grid">
            {visibleEvents.map((e) => (
              <article
                className="ca-card ca-event-card"
                data-festival={e.categoryId?.festival}
                key={e._id}
              >
                <p>
                  {e.categoryId?.festival} / {e.categoryId?.name}
                </p>
                <h3>{e.title}</h3>
                <p>
                  {e.mode === "solo_or_team"
                    ? "Solo or team"
                    : e.mode === "team"
                      ? "Team"
                      : "Solo"}{" "}
                  ·{" "}
                  {e.formPublished
                    ? "Registration form published"
                    : "Registration form draft"}
                </p>
                <div className="ca-toolbar">
                  <button
                    onClick={() =>
                      setEditing({
                        ...e,
                        categoryId: e.categoryId._id,
                        fields:
                          e.formVersions.find(
                            (f) => f.version === e.currentVersion,
                          )?.fields || [],
                      })
                    }
                  >
                    {e.formPublished
                      ? "Update registration form"
                      : "Edit registration form"}
                  </button>
                  <button className="ca-secondary" onClick={() => setReview(e)}>
                    Responses
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!resource.loading && !visibleEvents.length && (
            <p>No matching events.</p>
          )}
        </>
      )}
    </section>
  );
}
function EventEditor({ event, categories, onClose, onSaved }) {
  const { staff } = usePortal();
  const admin = staff.role === "admin";
  const responseStatus = useResource(
    `/staff/events/${event._id}/response-status`,
  );
  const [draft, setDraft] = useState(() => ({
      ...event,
      fields: event.fields.map((field) =>
        field.type === "link" && !field.help?.trim()
          ? { ...field, help: defaultLinkInstructions }
          : field,
      ),
    })),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(false),
    [previewAnswers, setPreviewAnswers] = useState({}),
    [updatedAnswerDeadline, setUpdatedAnswerDeadline] = useState(""),
    [extendReviewDeadline, setExtendReviewDeadline] = useState(false),
    [extendedDeadline, setExtendedDeadline] = useState("");
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const changeField = (index, key, value) =>
    set(
      "fields",
      draft.fields.map((f, i) =>
        i === index
          ? {
              ...f,
              [key]: value,
              ...(key === "type" && value === "link" && !f.help?.trim()
                ? { help: defaultLinkInstructions }
                : {}),
            }
          : f,
      ),
    );
  function move(index, delta) {
    const list = [...draft.fields];
    [list[index], list[index + delta]] = [list[index + delta], list[index]];
    set("fields", list);
  }
  const dateValue = (date) =>
    date
      ? new Date(
          new Date(date).getTime() - new Date(date).getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16)
      : "";
  const originalFields = event.fields;
  const questionsChanged =
    originalFields.length !== draft.fields.length ||
    draft.fields.some((field) => {
      const previous = originalFields.find((item) => item.id === field.id);
      return (
        !previous ||
        previous.label !== field.label ||
        previous.type !== field.type ||
        !!previous.required !== !!field.required ||
        JSON.stringify(
          previous.options.map((option) => option.trim()).filter(Boolean),
        ) !==
          JSON.stringify(
            field.options.map((option) => option.trim()).filter(Boolean),
          )
      );
    });
  const existingParticipantsNeedReview =
    !!draft.formPublished &&
    ((!!responseStatus.data?.hasResponses && questionsChanged) ||
      (!!responseStatus.data?.hasPendingUpdates &&
        (!draft.responseUpdateDeadline ||
          new Date(draft.responseUpdateDeadline).getTime() <= Date.now())));
  const adminNeedsCoordinatorDeadline =
    admin &&
    existingParticipantsNeedReview &&
    (!draft.responseUpdateDeadline ||
      new Date(draft.responseUpdateDeadline).getTime() <= Date.now());
  async function save(e) {
    e.preventDefault();
    if (responseStatus.loading || responseStatus.error) return;
    setBusy(true);
    setError("");
    try {
      const fields = draft.fields.map((f) => ({
        ...f,
        options: f.options.map((o) => o.trim()).filter(Boolean),
      }));
      const body = admin
        ? {
            ...draft,
            minTeamSize: draft.mode === "solo_or_team" ? 1 : draft.minTeamSize,
            fields,
            opensAt: draft.opensAt
              ? new Date(draft.opensAt).toISOString()
              : null,
            closesAt: draft.closesAt,
            responseUpdateDeadline: draft.responseUpdateDeadline,
          }
        : {
            fields,
            revision: draft.revision,
            formPublished: !!draft.formPublished,
            mode: draft.mode,
            minTeamSize: draft.mode === "solo_or_team" ? 1 : draft.minTeamSize,
            maxTeamSize: draft.maxTeamSize,
            allowEdits: !!draft.allowEdits,
            closesAt: draft.closesAt
              ? new Date(draft.closesAt).toISOString()
              : null,
            responseUpdateDeadline: existingParticipantsNeedReview
              ? new Date(updatedAnswerDeadline).toISOString()
              : extendReviewDeadline
                ? new Date(extendedDeadline).toISOString()
                : draft.responseUpdateDeadline || null,
          };
      await portalApi.put(`/staff/events/${draft._id}`, body);
      await onSaved();
    } catch (e) {
      setError(message(e));
      if (message(e).includes("response update deadline")) {
        await responseStatus.reload();
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <div className="ca-heading ca-editor-heading">
        <button className="ca-secondary" onClick={onClose}>
          Back
        </button>
        <h2>{draft.title}</h2>
      </div>
      <form onSubmit={save} className="ca-card ca-form">
        <p>
          {categories.find((c) => c._id === draft.categoryId)?.name} /{" "}
          {draft.title}
        </p>
        <fieldset className="ca-builder-question">
          <legend>Participation settings</legend>
          <p>
            Choose whether participants register alone, as a team, or either
            way.
          </p>
          <div className="ca-grid">
            <label>
              Participation
              <select
                disabled={!admin && !!draft.participationLockedAt}
                value={draft.mode}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    mode: e.target.value,
                    minTeamSize:
                      e.target.value === "team" ? current.minTeamSize : 1,
                    maxTeamSize:
                      e.target.value === "solo" ? 1 : current.maxTeamSize,
                  }))
                }
              >
                <option value="solo">Solo</option>
                <option value="team">Team</option>
                <option value="solo_or_team">Solo or team</option>
              </select>
            </label>
            {draft.mode !== "solo" && (
              <>
                {draft.mode === "team" && (
                  <label>
                    Minimum team size
                    <input
                      type="number"
                      disabled={!admin && !!draft.participationLockedAt}
                      required
                      min={1}
                      max={100}
                      value={draft.minTeamSize}
                      onChange={(e) => set("minTeamSize", e.target.value)}
                    />
                  </label>
                )}
                {draft.mode === "solo_or_team" && (
                  <p>
                    Minimum participants: 1 (individual registration is always
                    available).
                  </p>
                )}
                <label>
                  Maximum team size
                  <input
                    type="number"
                    disabled={!admin && !!draft.participationLockedAt}
                    required
                    min={draft.mode === "solo_or_team" ? 1 : draft.minTeamSize}
                    max={100}
                    value={draft.maxTeamSize}
                    onChange={(e) => set("maxTeamSize", e.target.value)}
                  />
                </label>
              </>
            )}
          </div>
          {!admin && draft.participationLockedAt && (
            <small>
              Participation mode and team size were locked when this form was
              first published. An admin can make a protected correction.
            </small>
          )}
        </fieldset>
        {admin && (
          <fieldset className="ca-builder-question">
            <legend>Admin event settings</legend>
            <div className="ca-grid">
              <label>
                Eligible branches (one per line, blank = all)
                <textarea
                  value={draft.allowedBranches.join("\n")}
                  onChange={(e) =>
                    set("allowedBranches", e.target.value.split("\n"))
                  }
                />
              </label>
              <label>
                Opens (your local time)
                <input
                  type="datetime-local"
                  value={dateValue(draft.opensAt)}
                  onChange={(e) => set("opensAt", e.target.value)}
                />
              </label>
              <label>
                Status
                <select
                  value={draft.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  {["published", "closed", "archived", "cancelled"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>
        )}
        <h3>Registration questions</h3>
        <p>
          CA ID, name, email and profile details are attached automatically. Use
          link questions for Drive files/folders. Published responses keep the
          form version used at submission.
        </p>
        {draft.fields.map((f, i) => (
          <fieldset className="ca-builder-question" key={f.id}>
            <legend>Question {i + 1}</legend>
            <label>
              Label
              <input
                required
                value={f.label}
                maxLength={200}
                onChange={(e) => changeField(i, "label", e.target.value)}
              />
            </label>
            <label>
              Type
              <select
                value={f.type}
                onChange={(e) => changeField(i, "type", e.target.value)}
              >
                {[
                  ["text", "Short answer"],
                  ["paragraph", "Paragraph"],
                  ["number", "Number"],
                  ["date", "Date"],
                  ["select", "Dropdown"],
                  ["radio", "Multiple choice"],
                  ["checkbox", "Checkboxes"],
                  ["link", "File / folder URL"],
                ].map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Instructions
              <textarea
                maxLength={1000}
                value={f.help}
                onChange={(e) => changeField(i, "help", e.target.value)}
              />
            </label>
            {["select", "radio", "checkbox"].includes(f.type) && (
              <ChoiceOptionsEditor
                type={f.type}
                options={f.options}
                onChange={(options) => changeField(i, "options", options)}
              />
            )}
            <label className="ca-choice">
              <input
                type="checkbox"
                checked={f.required}
                onChange={(e) => changeField(i, "required", e.target.checked)}
              />
              Required
            </label>
            <div className="ca-toolbar">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                Move up
              </button>
              <button
                type="button"
                disabled={i === draft.fields.length - 1}
                onClick={() => move(i, 1)}
              >
                Move down
              </button>
              <button
                type="button"
                className="ca-secondary"
                onClick={() =>
                  set(
                    "fields",
                    draft.fields.filter((_, index) => index !== i),
                  )
                }
              >
                Remove question
              </button>
            </div>
          </fieldset>
        ))}
        <div className="ca-toolbar">
          <button
            type="button"
            disabled={draft.fields.length >= 50}
            onClick={() =>
              set("fields", [
                ...draft.fields,
                {
                  id: crypto.randomUUID(),
                  label: "",
                  help: "",
                  type: "text",
                  required: false,
                  options: [],
                },
              ])
            }
          >
            Add question
          </button>
          <button
            type="button"
            className="ca-secondary"
            onClick={() => {
              setPreview(!preview);
              setPreviewAnswers({});
            }}
          >
            {preview ? "Hide preview" : "Preview form"}
          </button>
        </div>
        <div
          className={`ca-publish-panel${admin ? " ca-publish-panel-admin" : ""}`}
        >
          {!admin && (
            <label className="ca-update-deadline">
              Registration closes (your local time)
              <input
                type="datetime-local"
                value={dateValue(draft.closesAt)}
                onChange={(e) => set("closesAt", e.target.value)}
              />
              <small>
                Optional. Leave blank to keep registration open while the form
                and event remain published. If set, no new person or team can
                register after this time.
              </small>
            </label>
          )}
          <label className="ca-choice">
            <input
              type="checkbox"
              checked={!!draft.formPublished}
              onChange={(e) => set("formPublished", e.target.checked)}
            />
            <span>
              <strong>
                {event.formPublished
                  ? "Registration form is published"
                  : "Publish registration form"}
              </strong>
              <small>
                {event.formPublished
                  ? "Save updates the live form. Uncheck to unpublish it."
                  : "Save below to apply this setting."}
              </small>
            </span>
          </label>
          <label className="ca-choice ca-answer-edits">
            <input
              type="checkbox"
              checked={draft.allowEdits}
              onChange={(e) => set("allowEdits", e.target.checked)}
            />
            Allow answer edits while registration is open
          </label>
          {existingParticipantsNeedReview && (
            <div className="ca-form-update-notice" role="status">
              <strong>Existing participants need to review this form.</strong>
              <p>
                {questionsChanged
                  ? "You changed registration questions after responses were submitted."
                  : "Some existing participants still need to review the published form."}{" "}
                Set a deadline for them to submit updated answers. This does not
                reopen new registrations.
              </p>
              {!admin ? (
                <label>
                  Deadline for existing participants to submit updated answers
                  (your local time)
                  <input
                    type="datetime-local"
                    required
                    min={dateValue(new Date())}
                    value={updatedAnswerDeadline}
                    onChange={(e) => setUpdatedAnswerDeadline(e.target.value)}
                  />
                </label>
              ) : (
                <p>
                  {adminNeedsCoordinatorDeadline
                    ? "A coordinator must set a future updated-answer deadline before these question changes can be published."
                    : `The existing updated-answer deadline is ${new Date(draft.responseUpdateDeadline).toLocaleString()}.`}
                </p>
              )}
            </div>
          )}
          {!admin &&
            !existingParticipantsNeedReview &&
            !!draft.responseUpdateDeadline &&
            !!responseStatus.data?.hasResponses && (
              <div className="ca-review-extension">
                <button
                  type="button"
                  className="ca-secondary"
                  onClick={() => {
                    setExtendReviewDeadline((current) => !current);
                    setExtendedDeadline(
                      dateValue(draft.responseUpdateDeadline),
                    );
                  }}
                >
                  {extendReviewDeadline
                    ? "Cancel deadline extension"
                    : "Extend existing participant review deadline"}
                </button>
                {extendReviewDeadline && (
                  <label>
                    New deadline for existing participants (your local time)
                    <input
                      type="datetime-local"
                      required
                      min={dateValue(new Date())}
                      value={extendedDeadline}
                      onChange={(e) => setExtendedDeadline(e.target.value)}
                    />
                  </label>
                )}
              </div>
            )}
          {responseStatus.loading && (
            <DataLoading label="Checking existing responses…" compact />
          )}
          {responseStatus.error && (
            <p className="ca-error" role="alert">
              Could not check existing responses: {responseStatus.error}{" "}
              <button
                type="button"
                className="ca-secondary"
                onClick={responseStatus.reload}
              >
                Retry
              </button>
            </p>
          )}
          <button
            disabled={
              busy ||
              responseStatus.loading ||
              !!responseStatus.error ||
              adminNeedsCoordinatorDeadline
            }
          >
            {busy
              ? "Saving…"
              : event.formPublished && draft.formPublished
                ? "Update published form"
                : "Save subevent & form"}
          </button>
        </div>
        {error && (
          <p className="ca-error" role="alert">
            {error}
          </p>
        )}
      </form>
      {preview && (
        <section className="ca-card">
          <h3>Participant form preview</h3>
          <FormFields
            fields={draft.fields}
            answers={previewAnswers}
            setAnswers={setPreviewAnswers}
          />
        </section>
      )}
    </section>
  );
}
function ResponseReview({ event, category, events = [], onClose }) {
  const [page, setPage] = useState(1),
    [selectedEventId, setSelectedEventId] = useState(event?._id || ""),
    [searchText, setSearchText] = useState(""),
    [search, setSearch] = useState(""),
    resource = useResource(
      category
        ? `/staff/categories/${category._id}/registrations?page=${page}${selectedEventId ? `&eventId=${selectedEventId}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`
        : `/staff/events/${event._id}/registrations?page=${page}${search ? `&q=${encodeURIComponent(search)}` : ""}`,
    ),
    [error, setError] = useState(""),
    [exporting, setExporting] = useState(null);
  const exportEvent =
    event || events.find((item) => item._id === selectedEventId);
  async function download(format) {
    if (exporting || !exportEvent) return;
    setExporting(format);
    setError("");
    try {
      const { data } = await portalApi.get(
        `/staff/events/${exportEvent._id}/export?format=${format}`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(data),
        el = document.createElement("a");
      el.href = url;
      el.download = `${exportEvent.title.replace(/[^a-z0-9_-]/gi, "_")}-registrations.${format}`;
      el.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(message(e));
    } finally {
      setExporting(null);
    }
  }
  return (
    <section>
      <div className="ca-heading ca-editor-heading">
        <button className="ca-secondary" onClick={onClose}>
          Back
        </button>
        <h2>{category?.name || event.title} · Responses</h2>
      </div>
      <div className="ca-toolbar">
        {category && (
          <label>
            Event
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All category events</option>
              {events.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          className={exporting === "xlsx" ? "ca-export-active" : undefined}
          disabled={!!exporting || !exportEvent}
          aria-busy={exporting === "xlsx"}
          onClick={() => download("xlsx")}
        >
          {exporting === "xlsx" && (
            <span className="ca-export-spinner" aria-hidden="true" />
          )}
          {exporting === "xlsx" ? "Preparing Excel…" : "Download Excel"}
        </button>
        <button
          className={exporting === "csv" ? "ca-export-active" : undefined}
          disabled={!!exporting || !exportEvent}
          aria-busy={exporting === "csv"}
          onClick={() => download("csv")}
        >
          {exporting === "csv" && (
            <span className="ca-export-spinner" aria-hidden="true" />
          )}
          {exporting === "csv" ? "Preparing CSV…" : "Download CSV"}
        </button>
        <span>{resource.data?.total || 0} registrations</span>
        {exporting && (
          <span className="ca-export-status" role="status" aria-live="polite">
            Preparing {exporting === "xlsx" ? "Excel" : "CSV"} file…
          </span>
        )}
      </div>
      <form
        className="ca-response-search"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchText.trim());
          setPage(1);
        }}
      >
        <label>
          Search responses
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            maxLength={80}
            placeholder="Team, participant name or CA ID"
          />
        </label>
        <button type="submit">Search</button>
        {search && (
          <button
            type="button"
            className="ca-secondary"
            onClick={() => {
              setSearchText("");
              setSearch("");
              setPage(1);
            }}
          >
            Clear
          </button>
        )}
      </form>
      {category && !exportEvent && (
        <p>Select an event to export its responses to Excel or CSV.</p>
      )}
      {(error || resource.error) && (
        <p className="ca-error" role="alert">
          {error || resource.error}
        </p>
      )}
      {resource.loading && <DataLoading label="Loading responses…" />}
      {!resource.loading && !resource.error && resource.data?.total === 0 && (
        <p>{search ? "No matching responses." : "No responses yet."}</p>
      )}
      {!resource.loading &&
        !resource.error &&
        resource.data?.registrations.map((r) => (
          <article
            className="ca-card ca-response-card"
            key={`${r._id}-${r.revision}`}
          >
            {category && (
              <p>
                <strong>{r.eventId?.title || "Archived event"}</strong>
              </p>
            )}
            <h3>{r.teamName || r.participants[0]?.name}</h3>
            <p>
              Registration {r._id} · Form version {r.formVersion}
              <br />
              {new Date(r.createdAt).toLocaleString()}
            </p>
            {r.formUpdateNeeded && (
              <p className="ca-notice">
                {r.formUpdateDeadline &&
                new Date(r.formUpdateDeadline).getTime() <= Date.now()
                  ? "Form update deadline passed; original response remains recorded"
                  : "Updated form awaiting participant response"}
                {r.formUpdateDeadline &&
                  ` · Due ${new Date(r.formUpdateDeadline).toLocaleString()}`}
              </p>
            )}
            <div className="ca-table-wrap">
              <table>
                <thead>
                  <tr>
                    {[
                      "CA ID",
                      "Name",
                      "Email",
                      "College",
                      "College reg. no.",
                      "Course",
                      "Year",
                      "Branch",
                      "Phone",
                    ].map((x) => (
                      <th key={x}>{x}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {r.participants.map((p) => (
                    <tr key={p.caId}>
                      {[
                        "caId",
                        "name",
                        "email",
                        "college",
                        "registrationNumber",
                        "course",
                        "year",
                        "branch",
                        "phone",
                      ].map((k) => (
                        <td key={k}>{p[k]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AnswerView fields={r.fields} answers={r.answers} />
            {!!r.answerHistory?.length && (
              <details>
                <summary>Earlier form responses</summary>
                {r.answerHistory.map((entry, index) => (
                  <div key={`${entry.formVersion}-${index}`}>
                    <p>Form version {entry.formVersion}</p>
                    <AnswerView fields={entry.fields} answers={entry.answers} />
                  </div>
                ))}
              </details>
            )}
          </article>
        ))}
      <div className="ca-toolbar">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>Page {page}</span>
        <button
          disabled={page * 50 >= (resource.data?.total || 0)}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
