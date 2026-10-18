import { useEffect, useState } from "react";
import { DataLoading } from "./PortalLoading";
import { useResource } from "./useResource";

const labels = {
  "category.create": "Category created",
  "category.update": "Category updated",
  "coordinator.assign": "Coordinator access assigned",
  "coordinator.reset": "Coordinator password reset",
  "coordinator.revoke": "Coordinator access changed / revoked",
  "coordinator.activate": "Coordinator access restored",
  "event.update": "Event / form updated",
  "registration.review": "Legacy registration review",
};

export function AuditLogs() {
  const [filters, setFilters] = useState({}),
    [page, setPage] = useState(1),
    [actions, setActions] = useState([]);
  const query = new URLSearchParams({
    ...filters,
    page: String(page),
  }).toString();
  function apply(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = {};
    for (const name of ["action", "actor", "targetId"]) {
      const value = form.get(name)?.trim();
      if (value) next[name] = value;
    }
    if (form.get("from"))
      next.from = new Date(`${form.get("from")}T00:00:00`).toISOString();
    if (form.get("to")) {
      const end = new Date(`${form.get("to")}T00:00:00`);
      end.setDate(end.getDate() + 1);
      next.to = end.toISOString();
    }
    setFilters(next);
    setPage(1);
  }
  return (
    <section>
      <h2>Fest audit logs</h2>
      <p>
        Recorded category changes, coordinator access changes, event/form
        updates. Older registration-review entries remain in the audit history.
      </p>
      <form
        className="ca-card"
        onSubmit={apply}
        onReset={() => {
          setFilters({});
          setPage(1);
        }}
      >
        <div className="ca-grid">
          <label>
            Action
            <select name="action">
              <option value="">All actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {labels[action] || action}
                </option>
              ))}
            </select>
          </label>
          <label>
            Staff member
            <input
              name="actor"
              placeholder="Name, email or CA ID"
              maxLength={200}
            />
          </label>
          <label>
            Target record ID
            <input
              name="targetId"
              maxLength={200}
              placeholder="Optional record ID"
            />
          </label>
          <label>
            From date
            <input name="from" type="date" />
          </label>
          <label>
            Through date
            <input name="to" type="date" />
          </label>
        </div>
        <div className="ca-toolbar">
          <button type="submit">Apply filters</button>
          <button type="reset" className="ca-secondary">
            Clear filters
          </button>
        </div>
      </form>
      <AuditLogResults
        key={query}
        query={query}
        page={page}
        onPage={setPage}
        onActions={setActions}
      />
    </section>
  );
}

function AuditLogResults({ query, page, onPage, onActions }) {
  const resource = useResource(`/staff/audits?${query}`);
  useEffect(() => {
    if (resource.data?.actions) onActions(resource.data.actions);
  }, [resource.data, onActions]);
  return (
    <>
      <div className="ca-toolbar">
        <span>{resource.data?.total ?? 0} audit entries</span>
        <button
          className="ca-secondary"
          onClick={resource.reload}
          disabled={resource.loading}
        >
          Refresh logs
        </button>
      </div>
      {resource.loading && <DataLoading label="Loading audit logs" />}
      {resource.error && (
        <p className="ca-error" role="alert">
          {resource.error}
        </p>
      )}
      {!resource.loading && resource.data && (
        <>
          {resource.data.logs.length ? (
            <div className="ca-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Staff member</th>
                    <th>Action</th>
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {resource.data.logs.map((log) => (
                    <tr key={log._id}>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                      <td>
                        {log.staffId ? (
                          <>
                            {log.staffId.name}
                            <br />
                            {log.staffId.email}
                            <br />
                            <small>
                              {log.staffId.caId} · {log.staffId.role}
                            </small>
                          </>
                        ) : (
                          "Staff account unavailable"
                        )}
                      </td>
                      <td>
                        {labels[log.action] || log.action}
                        <small>{log.action}</small>
                      </td>
                      <td>
                        {log.targetLabel}
                        <small>{log.targetId}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No audit entries match these filters.</p>
          )}
          <div className="ca-toolbar">
            <button disabled={page <= 1} onClick={() => onPage(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {Math.max(1, Math.ceil(resource.data.total / 50))}
            </span>
            <button
              disabled={page * 50 >= resource.data.total}
              onClick={() => onPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
}
