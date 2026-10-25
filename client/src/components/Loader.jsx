import { useEffect, useRef } from "react";
import { preloadPublicRoute } from "./publicRoutePreload";

const MEANDER_PATH =
  "M0 14h18V2h24v24H6V10h24v8H18v-4h24v12h24V2h24v24H54V10h24v8H66v-4h24v12h24V2h24v24h-36V10h24v8h-12v-4h24";

const HOMEPAGE_HERO_VIDEO = "/media/homepage/videos/hero_video.webm";

function warmHomepageMedia() {
  // The hero is the only large request needed behind the opening scroll.
  // Subsequent routes warm after reveal or when a visitor approaches a link.
  const hero = document.createElement("video");
  hero.preload = "auto";
  hero.muted = true;
  hero.playsInline = true;
  hero.src = HOMEPAGE_HERO_VIDEO;
  const ready = new Promise((resolve) => {
    hero.addEventListener("loadeddata", resolve, { once: true });
    hero.addEventListener("error", resolve, { once: true });
  });
  hero.load();
  return ready;
}

export default function OracleScrollLoader({ onComplete }) {
  const loaderRef = useRef(null);

  useEffect(() => {
    let active = true;
    let completionTimer;
    const heroReady = warmHomepageMedia();
    const scrollOpened = new Promise((resolve) => window.setTimeout(resolve, 2550));
    const mediaDeadline = new Promise((resolve) => window.setTimeout(resolve, 4500));

    Promise.all([
      scrollOpened,
      preloadPublicRoute("/", { images: false }),
      Promise.race([heroReady, mediaDeadline]),
    ]).then(() => {
      if (!active) return;
      loaderRef.current?.classList.add("oracle-loader-leaving");
      completionTimer = window.setTimeout(() => onComplete?.(), 500);
    });

    return () => {
      active = false;
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
      <div className="oracle-loader-backdrop" aria-hidden="true" />
      <div className="oracle-loader-haze" />
      <div className="oracle-loader-stars" />

      <div className="oracle-scroll-stage">
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
