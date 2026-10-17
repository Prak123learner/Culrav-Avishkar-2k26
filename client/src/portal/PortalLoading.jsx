import "./portal.css";

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
