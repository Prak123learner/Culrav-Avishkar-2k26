import "./portal.css";

export function DataLoading({
  label = "Loading festival details",
  compact = false,
}) {
  return (
    <div
      className={`ca-data-loading${compact ? " ca-data-loading-compact" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="ca-data-loading-caption">
        <span className="ca-data-spinner" aria-hidden="true" />
        <span>{label}</span>
      </div>
      {!compact && (
        <div className="ca-data-skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
}

export function DataLoadingPage({ label, festival }) {
  return (
    <main
      className="ca-portal ca-registration ca-data-loading-page"
      data-festival={festival}
    >
      <div className="ca-registration-content">
        <DataLoading label={label} />
      </div>
    </main>
  );
}

export function PortalLoading({ label = "Preparing your festival space" }) {
  return (
    <main className="ca-portal ca-session-loading" aria-busy="true">
      <section className="ca-session-loading-card" aria-live="polite">
        <div className="ca-session-orbit" aria-hidden="true">
          <span />
          <i>CA</i>
        </div>
        <span className="ca-kicker">Culrav × Avishkar</span>
        <strong>{label}</strong>
        <p>Securing your session</p>
      </section>
    </main>
  );
}
