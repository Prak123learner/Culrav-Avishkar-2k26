import { useEffect, useRef } from "react";

const MEANDER_PATH =
  "M0 14h18V2h24v24H6V10h24v8H18v-4h24v12h24V2h24v24H54V10h24v8H66v-4h24v12h24V2h24v24h-36V10h24v8h-12v-4h24";

export default function OracleScrollLoader({ onComplete }) {
  const loaderRef = useRef(null);

  useEffect(() => {
    const revealTimer = window.setTimeout(() => {
      loaderRef.current?.classList.add("oracle-loader-leaving");
    }, 3150);
    const completionTimer = window.setTimeout(() => {
      onComplete?.();
    }, 3750);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      className="oracle-loader"
      role="status"
      aria-live="polite"
      aria-label="Opening Culrav Avishkar"
    >
      <div className="oracle-loader-haze" />
      <div className="oracle-loader-stars" />

      <div className="oracle-scroll-stage">
        <div className="oracle-scroll-shadow" />
        <div className="oracle-scroll">
          <div className="oracle-scroll-sheet">
            <span className="oracle-scroll-roll oracle-scroll-roll-top">
              <span className="oracle-scroll-roll-paper" />
            </span>
            <span className="oracle-scroll-roll oracle-scroll-roll-bottom">
              <span className="oracle-scroll-roll-paper" />
            </span>

            <div className="oracle-scroll-viewport">
              <div className="oracle-scroll-surface">
                <Meander className="oracle-meander oracle-meander-top" />

                <div className="oracle-scroll-content">
                  <span className="oracle-eyebrow">Echoes of Olympus</span>
                  <img
                    src="/media/common/branding/logo_avishkar_culrav.png"
                    alt="Culrav Avishkar"
                    className="oracle-logo"
                  />
                  <p className="oracle-copy">The realms awaken</p>
                </div>

                <Meander className="oracle-meander oracle-meander-bottom" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading the festival experience</span>
    </div>
  );
}

function Meander({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 138 28"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={MEANDER_PATH} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

import { RouteSuspenseLoader } from "./NavigationPortalLoader";

export function RouteLoader() {
  return <RouteSuspenseLoader />;
}
