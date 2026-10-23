import loginBg from "../assets/common/backgrounds/Background_of_login_page.webp";
import AvishkarBG from "../assets/common/backgrounds/AvishkarBG.webp";
import CulravBG from "../assets/common/backgrounds/CulravBG.webp";
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

export function TeamsSkeleton() {
  return (
    <div className="ca-grid" aria-label="Loading teams" aria-busy="true">
      {[1, 2].map((i) => (
        <article className="ca-card ca-team-record ca-skeleton-card" key={i}>
          <div className="ca-record-title">
            <span className="ca-skeleton-block ca-skeleton-circle" aria-hidden="true" />
            <div style={{ flex: 1 }}>
              <span className="ca-skeleton-block" style={{ width: "28%", height: 10, marginBottom: 8 }} />
              <span className="ca-skeleton-block" style={{ width: "65%", height: 22 }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            <span className="ca-skeleton-block" style={{ width: "42%", height: 12 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 12 }}>
              <span className="ca-skeleton-block" style={{ width: "75%", height: 14 }} />
              <span className="ca-skeleton-block" style={{ width: "60%", height: 14 }} />
            </div>
            <span className="ca-skeleton-block" style={{ width: "38%", height: 12, marginTop: 6 }} />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <span className="ca-skeleton-block" style={{ width: "60%", height: 38 }} />
              <span className="ca-skeleton-block" style={{ width: "35%", height: 38 }} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function RegistrationsSkeleton() {
  return (
    <div aria-label="Loading registrations" aria-busy="true" style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 24 }}>
      {[1, 2].map((i) => (
        <article className="ca-card ca-registration-entry ca-skeleton-card" key={i}>
          <div className="ca-record-title">
            <span className="ca-skeleton-block ca-skeleton-circle" aria-hidden="true" />
            <div style={{ flex: 1 }}>
              <span className="ca-skeleton-block" style={{ width: "22%", height: 10, marginBottom: 8 }} />
              <span className="ca-skeleton-block" style={{ width: "55%", height: 22 }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            <span className="ca-skeleton-block" style={{ width: "45%", height: 14 }} />
            <span className="ca-skeleton-block" style={{ width: "32%", height: 14 }} />
            <span className="ca-skeleton-block" style={{ width: "70%", height: 14 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 14, paddingTop: 16, borderTop: "1px solid rgba(126, 77, 33, 0.2)" }}>
              <span className="ca-skeleton-block" style={{ height: 24 }} />
              <span className="ca-skeleton-block" style={{ height: 24 }} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CategoriesSkeleton() {
  return (
    <div className="ca-grid" aria-label="Loading categories" aria-busy="true">
      {["I", "II"].map((numeral) => (
        <div className="ca-festival-tile ca-skeleton-card" key={numeral} style={{ pointerEvents: "none" }}>
          <span className="ca-realm-order" aria-hidden="true">
            {numeral}
          </span>
          <span className="ca-realm-copy" style={{ width: "100%" }}>
            <span className="ca-skeleton-block" style={{ width: "30%", height: 12, marginBottom: 10 }} />
            <span className="ca-skeleton-block" style={{ width: "60%", height: 36, marginBottom: 14 }} />
            <span className="ca-realm-divider" aria-hidden="true" />
            <span className="ca-skeleton-block" style={{ width: "40%", height: 14, marginTop: 10 }} />
          </span>
          <span className="ca-realm-enter">
            <span className="ca-skeleton-block" style={{ width: 90, height: 14 }} />
          </span>
        </div>
      ))}
    </div>
  );
}

export function SubeventsSkeleton() {
  return (
    <div className="ca-grid" aria-label="Loading subevents" aria-busy="true" style={{ marginTop: 24 }}>
      {[1, 2, 3, 4].map((i) => (
        <article className="ca-card ca-event-card ca-skeleton-card" key={i}>
          <span className="ca-skeleton-block" style={{ width: "35%", height: 12, marginBottom: 8 }} />
          <span className="ca-skeleton-block" style={{ width: "70%", height: 24, marginBottom: 10 }} />
          <span className="ca-skeleton-block" style={{ width: "50%", height: 14, marginBottom: 18 }} />
          <div className="ca-toolbar" style={{ marginTop: 14 }}>
            <span className="ca-skeleton-block" style={{ width: 95, height: 36 }} />
            <span className="ca-skeleton-block" style={{ width: 110, height: 36 }} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function DataLoadingPage({ label = "Preparing your registration", festival }) {
  const isCulrav = festival === "culrav";
  const bgImage = isCulrav ? CulravBG : AvishkarBG;
  return (
    <main
      className="ca-portal ca-registration min-h-screen w-full relative text-[#241104] overflow-x-hidden font-sans select-none"
      data-festival={festival}
      aria-label={label}
      aria-busy="true"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#3b1e0d]/42 via-[#6f3918]/18 to-[#2b1509]/34 z-0" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-28">
        <div
          className="ca-registration-back inline-flex items-center gap-2 px-4 py-2 border-2 border-[#b88c4b]/50 bg-[#fffdf8]/90 text-[#4d260f] font-cinzel text-xs font-bold uppercase tracking-[0.18em] shadow-sm mb-8 rounded-xs"
          style={{ width: 180, height: 38 }}
        >
          <span className="ca-skeleton-block" style={{ width: "100%", height: 12 }} />
        </div>

        <header className="text-center max-w-4xl mx-auto mb-10 sm:mb-12 flex flex-col items-center">
          <span className="ca-skeleton-block" style={{ width: 220, height: 14, marginBottom: 12 }} />
          <span className="ca-skeleton-block" style={{ width: "60%", height: 44, marginBottom: 16 }} />
          <span className="ca-skeleton-block" style={{ width: 160, height: 26, borderRadius: 2 }} />
        </header>

        <div className="ca-registration-form max-w-4xl mx-auto">
          <section className="relative p-6 sm:p-10 lg:p-12 border-2 border-[#b88c4b] bg-gradient-to-b from-[#fffdfa] via-[#fbf3e4] to-[#f5e6c8] shadow-[0_24px_70px_rgba(50,25,8,0.2),0_4px_18px_rgba(50,25,8,0.1)] rounded-xs">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-[#a06a28]">✦</span>
              <span className="ca-skeleton-block" style={{ width: 190, height: 20 }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="p-3 bg-gradient-to-br from-[#ffffff] via-[#fffdf9] to-[#faf1df] border border-[#b88c4b]/50 rounded-xs shadow-sm">
                  <span className="ca-skeleton-block" style={{ width: "40%", height: 10, marginBottom: 8 }} />
                  <span className="ca-skeleton-block" style={{ width: "75%", height: 16 }} />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-[#b88c4b]/40">
              <span className="ca-skeleton-block" style={{ width: "30%", height: 14 }} />
              <span className="ca-skeleton-block" style={{ width: "100%", height: 46 }} />
              <span className="ca-skeleton-block" style={{ width: "100%", height: 50, marginTop: 12 }} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export function PortalLoading({
  label = "Opening the festival archives",
  subtext = "Consulting the festival archives",
  kicker = "Culrav × Avishkar",
  overlay = false,
  isLeaving = false,
}) {
  const containerClass = [
    "ca-portal ca-session-loading",
    overlay ? "ca-session-overlay" : "",
    isLeaving ? "ca-leaving" : "",
  ].filter(Boolean).join(" ");

  return (
    <main
      className={containerClass}
      aria-busy="true"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <section className="ca-session-loading-card" aria-live="polite">
        <div className="ca-session-ornament" aria-hidden="true">
          <span />
          <i>✦</i>
          <span />
        </div>
        <div className="ca-session-seal" aria-hidden="true">
          <div className="ca-session-seal-ring" />
          <i>CA</i>
        </div>
        <span className="ca-kicker">{kicker}</span>
        <strong>{label}</strong>
        <p>{subtext}</p>
        <div className="ca-session-progress" aria-hidden="true">
          <span />
        </div>
      </section>
    </main>
  );
}
