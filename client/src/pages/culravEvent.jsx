import React from "react";
import { useNavigate } from "react-router-dom";
import { RouteSuspenseLoader } from "../components/NavigationPortalLoader";
import { useImagePreloader } from "../components/useImagePreloader";
import { mobileRouteCriticalImages, routeCriticalImages } from "../components/routeCriticalImages";
import { preloadPublicRoute } from "../components/publicRoutePreload";

import CulravBG from "../assets/common/backgrounds/CulravBG.webp";
import image from "../assets/pages/culrav/CULRAV LOGO-display.webp";

// Culrav Cultural Event Cards (Pairs: Without Hover & With Hover)
import AnunaadWithoutHover from "../assets/pages/culrav/cards/Anunaad_Without_Hover.webp";
import AnunaadWithHover from "../assets/pages/culrav/cards/Anunaad_With_Hover.webp";

import RangmanchWithoutHover from "../assets/pages/culrav/cards/Rangmanch_without_hover.webp";
import RangmanchWithHover from "../assets/pages/culrav/cards/Rangmanch_with_hover.webp";

import DarkroomWithoutHover from "../assets/pages/culrav/cards/Darkroom_without_Hover.webp";
import DarkroomWithHover from "../assets/pages/culrav/cards/Darkroom_with_Hover.webp";

import LitmuseWithoutHover from "../assets/pages/culrav/cards/Litmuse_Without_Hover.webp";
import LitmuseWithHover from "../assets/pages/culrav/cards/Litmuse_With_Hover.webp";

import SpandanWithoutHover from "../assets/pages/culrav/cards/Spandan_Without_Hover.webp";
import SpandanWithHover from "../assets/pages/culrav/cards/Spandan_With_Hover.webp";

import RangsaaziWithoutHover from "../assets/pages/culrav/cards/Rangsaazi_without_hover.webp";
import RangsaaziWithHover from "../assets/pages/culrav/cards/Rangsaazi_with_hover.webp";

import RazzmatazzWithoutHover from "../assets/pages/culrav/cards/Razzmatazz_without_hover.webp";
import RazzmatazzWithHover from "../assets/pages/culrav/cards/Razzmatazz_with_hover.webp";

import CulravButtonPlaque from "../assets/pages/culrav/cards/CulravButtonCrop.webp";


function CulravEventCard({ event, onClick, eager, mobile }) {
  const clipPathStyle =
    event.customClip || "inset(4.7% 2.8% 4.7% 2.3% round 8px)";
  const cardImage = mobile ? event.withHover : event.withoutHover;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onPointerEnter={() => preloadPublicRoute(`/culrav/${event.slug}`, { images: false })}
      onFocus={() => preloadPublicRoute(`/culrav/${event.slug}`, { images: false })}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="group relative w-full max-w-[340px] sm:max-w-[360px] aspect-[2/3] cursor-pointer select-none transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] drop-shadow-[0_12px_28px_rgba(70,25,5,0.28)] hover:drop-shadow-[0_22px_45px_rgba(190,80,15,0.45)] focus:outline-none rounded-lg"
    >
      {/* Mobile opens directly in colour because touch screens have no hover state. */}
      <img
        src={cardImage}
        alt={event.name}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none rounded-lg culrav-card-stone"
        style={{
          clipPath: clipPathStyle,
          WebkitClipPath: clipPathStyle,
        }}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        draggable={false}
      />

      {!mobile && (
        <img
          src={event.withHover}
          alt={`${event.name} Active`}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-out rounded-lg culrav-card-stone"
          style={{
            clipPath: clipPathStyle,
            WebkitClipPath: clipPathStyle,
          }}
          loading="lazy"
          draggable={false}
        />
      )}

      {/* Event Title (Vertically aligned at ~58%) */}
      <div className="absolute top-[58%] left-[8%] right-[8%] z-20 flex flex-col items-center justify-center pointer-events-none text-center">
        <h3 className="font-dalek text-lg sm:text-xl md:text-2xl font-black uppercase tracking-[0.16em] text-[#361706] group-hover:text-[#612607] transition-colors drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] line-clamp-1">
          {event.name}
        </h3>

        {/* Classical Flourish / Star Divider */}
        <div className="flex items-center justify-center gap-2.5 w-36 sm:w-44 mt-2 sm:mt-1 text-[#995726]/75 group-hover:text-[#c2651b] transition-colors">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#995726] to-[#995726]" />
          <span className="text-[8px]">✦</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#995726] to-[#995726]" />
        </div>
      </div>

      {/* Event Description (In the open parchment area below the title and divider) */}
      <div className="absolute top-[66%] left-[11%] right-[11%] bottom-[19%] z-20 flex items-center justify-center pointer-events-none text-center">
        <p className="font-garamond text-xs sm:text-sm font-semibold text-[#542810] group-hover:text-[#381907] transition-colors px-2 leading-relaxed line-clamp-3">
          {event.tagline}
        </p>
      </div>

      {/* Bottom Action Plaque Button (Enter Realm) */}
      <div className="absolute bottom-[9.5%] left-[17%] right-[17%] h-[8%] z-20 flex items-center justify-center pointer-events-none">
        {/* Hexagonal Button Plaque Graphic */}
        <img
          src={CulravButtonPlaque}
          alt=""
          className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03] drop-shadow-[0_4px_8px_rgba(70,25,5,0.4)]"
          draggable={false}
        />

        {/* Text inside Button: ENTER REALM ➔ */}
        <span className="relative z-10 font-cinzel text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#fbf5ea] group-hover:text-[#ffd977] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] flex items-center gap-1.5">
          <span>Enter Realm</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1 text-[11px] sm:text-xs">➔</span>
        </span>
      </div>
    </div>
  );
}

function CulravEvent() {
  const navigate = useNavigate();
  const [mobile, setMobile] = React.useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches,
  );

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setMobile(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const events = [
    {
      id: "ce1",
      name: "Anunaad",
      slug: "anunaad",
      tagline: "Acoustic Harmonies, Vocals & Battle of the Bands",
      withoutHover: AnunaadWithoutHover,
      withHover: AnunaadWithHover,
    },
    {
      id: "ce2",
      name: "Rangmanch",
      slug: "rangmanch",
      tagline: "The Stage of Theatre, Dramatics & Street Plays",
      withoutHover: RangmanchWithoutHover,
      withHover: RangmanchWithHover,
    },
    {
      id: "ce3",
      name: "Darkroom",
      slug: "darkroom",
      tagline: "Photography, Cinematography & Visual Storytelling",
      withoutHover: DarkroomWithoutHover,
      withHover: DarkroomWithHover,
      customClip: "inset(2.6% 2.6% 4.0% 2.3% round 8px)",
    },
    {
      id: "ce4",
      name: "Litmuse",
      slug: "litmuse",
      tagline: "Poetry Slams, Elocution, Debates & Literary Arts",
      withoutHover: LitmuseWithoutHover,
      withHover: LitmuseWithHover,
    },
    {
      id: "ce5",
      name: "Spandan",
      slug: "spandan",
      tagline: "The Runway of Fashion, Panache & Elegance",
      withoutHover: SpandanWithoutHover,
      withHover: SpandanWithHover,
    },
    {
      id: "ce6",
      name: "Rangsaazi",
      slug: "rangsazzi",
      tagline: "Fine Arts, Canvas Painting & Creative Expressions",
      withoutHover: RangsaaziWithoutHover,
      withHover: RangsaaziWithHover,
    },
    {
      id: "ce7",
      name: "Razzmatazz",
      slug: "razzmatazz",
      tagline: "Classical, Western & Street Dance Choreography",
      withoutHover: RazzmatazzWithoutHover,
      withHover: RazzmatazzWithHover,
      customClip: "inset(2.6% 2.6% 4.0% 2.3% round 8px)",
    },
  ];
  const criticalAssetsReady = useImagePreloader(
    mobile ? mobileRouteCriticalImages["/culrav"] : routeCriticalImages["/culrav"],
  );

  if (!criticalAssetsReady) {
    return <RouteSuspenseLoader />;
  }

  return (
    <section
      className="relative min-h-screen w-full flex flex-col items-center justify-start text-white select-none"
      style={{
        backgroundImage: `url(${CulravBG})`,
        backgroundSize: "100% auto",
        backgroundPosition: "top center",
      }}
    >
      {/* Top Banner Group */}
      <div className="relative w-full overflow-hidden md:h-[300px] lg:h-[200px] sm:h-[300px] h-[450px] lg:mt-12 lg:mr-5">
        <div className="absolute inset-0 flex flex-col justify-center sm:px-8">
          <div className="w-full flex flex-col md:flex-row items-center justify-center md:gap-6">
            {/* Logo */}
            <div className="flex justify-center w-full md:w-1/3 mt-6 md:mt-0">
              <img
                src={image}
                className="w-75 sm:w-80 md:w-full max-w-[400px]"
                alt="Culrav Crest"
              />
            </div>

            {/* Description */}
            <div className="w-full md:w-2/3 flex justify-center">
              <p className="font-garamond p-6 text-center text-base sm:text-lg md:text-xl font-semibold leading-relaxed text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] max-w-2xl" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)" }}>
                The cultural mainframe glitches into a three-day celebration of
                pure artistic expression. From high-voltage music and dazzling dance
                to theatre and fine arts, step into the ultimate cultural spectacle.
              </p>
            </div>
          </div>
          <div className="w-full h-4"></div>
        </div>
      </div>

      {/* Grid of Culrav Cultural Cards */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 lg:gap-14 justify-items-center">
          {events.map((event, index) => (
            <CulravEventCard
              key={event.id}
              event={event}
              eager={index < 3}
              mobile={mobile}
              onClick={() => navigate(`/culrav/${event.slug}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CulravEvent;
