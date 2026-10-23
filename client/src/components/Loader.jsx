import { useEffect, useRef } from "react";
import CulravBG from "../assets/common/backgrounds/CulravBG.webp";
import AvishkarBG from "../assets/common/backgrounds/AvishkarBG.webp";
import AnunaadCard from "../assets/pages/culrav/cards/Anunaad_Without_Hover.webp";
import RangmanchCard from "../assets/pages/culrav/cards/Rangmanch_without_hover.webp";
import DarkroomCard from "../assets/pages/culrav/cards/Darkroom_without_Hover.webp";
import CyberquestCard from "../assets/pages/avishkar/cards/Cyberquest_without_hover.webp";
import ElectromaniaCard from "../assets/pages/avishkar/cards/Electromania_withouthover.webp";
import GenesisCard from "../assets/pages/avishkar/cards/Genesis_without_hover.webp";

const MEANDER_PATH =
  "M0 14h18V2h24v24H6V10h24v8H18v-4h24v12h24V2h24v24H54V10h24v8H66v-4h24v12h24V2h24v24h-36V10h24v8h-12v-4h24";

// The opening scroll is on screen long enough to warm the browser cache before
// the homepage is revealed. Keep the hero and backgrounds ahead of the archive
// videos so the first painted screen is never competing with four video files.
const HOMEPAGE_HERO_VIDEO = "/media/homepage/videos/hero_video.webm";
const HOMEPAGE_ARCHIVE_VIDEOS = [
  "/media/homepage/videos/v4.webm",
  "/media/homepage/videos/v1.webm",
  "/media/homepage/videos/v5.webm",
  "/media/homepage/videos/v2.webm",
];
const HOMEPAGE_BACKGROUNDS = [
  CulravBG,
  AvishkarBG,
  "/media/homepage/images/the-duality.webp",
  "/media/homepage/images/realm-card.webp",
  "/media/common/textures/parchment-bg.webp",
  "/media/common/textures/vintage-scratches.webp?v=2",
  "/media/homepage/images/card_culrav_clean.webp",
  "/media/homepage/images/card_avishkar_clean.webp",
  "/media/homepage/images/compass_divider.webp",
  "/media/homepage/images/footer-bg.webp",
  "/media/homepage/images/IcarusSun.webp",
  "/media/homepage/images/TwinLeaves.webp",
];
const REALM_CARD_PREVIEWS = [
  AnunaadCard,
  RangmanchCard,
  DarkroomCard,
  CyberquestCard,
  ElectromaniaCard,
  GenesisCard,
];

function warmHomepageMedia() {
  // Start the actual hero file immediately. The matching index.html preload is
  // deduplicated by the browser and gives this request the highest priority.
  const hero = document.createElement("video");
  hero.preload = "auto";
  hero.muted = true;
  hero.playsInline = true;
  hero.src = HOMEPAGE_HERO_VIDEO;
  hero.load();

  // Image objects populate the same memory/disk cache used by CSS background
  // images and <img> elements when the visitor opens another festival page.
  HOMEPAGE_BACKGROUNDS.forEach((src) => {
    const image = new Image();
    image.decoding = "async";
    image.src = src;
  });

  // Archive videos are useful below the fold, but must not delay the hero. A
  // low-priority prefetch lets the browser fetch them only when bandwidth allows.
  const videoPrefetchTimer = window.setTimeout(() => {
    HOMEPAGE_ARCHIVE_VIDEOS.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "video";
      link.href = href;
      link.type = "video/webm";
      document.head.appendChild(link);
    });
  }, 350);

  const realmCardPrefetchTimer = window.setTimeout(() => {
    REALM_CARD_PREVIEWS.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
    });
  }, 700);

  return () => {
    window.clearTimeout(videoPrefetchTimer);
    window.clearTimeout(realmCardPrefetchTimer);
  };
}

export default function OracleScrollLoader({ onComplete }) {
  const loaderRef = useRef(null);

  useEffect(() => {
    const stopWarmingMedia = warmHomepageMedia();
    const revealTimer = window.setTimeout(() => {
      loaderRef.current?.classList.add("oracle-loader-leaving");
    }, 3150);
    const completionTimer = window.setTimeout(() => {
      onComplete?.();
    }, 3750);

    return () => {
      stopWarmingMedia();
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
