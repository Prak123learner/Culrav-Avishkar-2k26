import React from "react";
import { useNavigate } from "react-router-dom";
import { RouteSuspenseLoader } from "../components/NavigationPortalLoader";
import { useImagePreloader } from "../components/useImagePreloader";
import { mobileRouteCriticalImages, routeCriticalImages } from "../components/routeCriticalImages";
import { preloadPublicRoute } from "../components/publicRoutePreload";

import AvishkarBG from "../assets/common/backgrounds/AvishkarBG.webp";
import image from "../assets/pages/avishkar/avishkarrr-display.webp";

// Avishkar Greek Mythological Event Cards (Pairs: Without Hover & With Hover)
import AstrogynamixWithoutHover from "../assets/pages/avishkar/cards/Astrogynamix_without_hover.webp";
import AstrogynamixWithHover from "../assets/pages/avishkar/cards/Astrogynamix_with_hover.webp";

import CosmoconWithoutHover from "../assets/pages/avishkar/cards/Cosmocon_without_hover.webp";
import CosmoconWithHover from "../assets/pages/avishkar/cards/Cosmocon_with_hover.webp";

import CyberquestWithoutHover from "../assets/pages/avishkar/cards/Cyberquest_without_hover.webp";
import CyberquestWithHover from "../assets/pages/avishkar/cards/Cyberquest_with_hover.webp";

import ElectromaniaWithoutHover from "../assets/pages/avishkar/cards/Electromania_withouthover.webp";
import ElectromaniaWithHover from "../assets/pages/avishkar/cards/Electromania_with_hover.webp";

import GenesisWithoutHover from "../assets/pages/avishkar/cards/Genesis_without_hover.webp";
import GenesisWithHover from "../assets/pages/avishkar/cards/Genesis_with_hover.webp";

import GnosomaniaWithoutHover from "../assets/pages/avishkar/cards/Gnosomania_without_hover.webp";
import GnosomaniaWithHover from "../assets/pages/avishkar/cards/Gnosomania_with_hover.webp";

import KreedomaniaWithoutHover from "../assets/pages/avishkar/cards/Kreedomania_without_hover.webp";
import KreedomaniaWithHover from "../assets/pages/avishkar/cards/Kreedomania_with_hover.webp";

import MechrocosmWithoutHover from "../assets/pages/avishkar/cards/Mechrocosm_without_hover.webp";
import MechrocosmWithHover from "../assets/pages/avishkar/cards/Mechrocosm_with_hover.webp";

import MonopolyWithoutHover from "../assets/pages/avishkar/cards/Monopoly_without_hover.webp";
import MonopolyWithHover from "../assets/pages/avishkar/cards/Monopoly_with_hover.webp";

import NirmaanWithoutHover from "../assets/pages/avishkar/cards/Nirmaan_without_hover.webp";
import NirmaanWithHover from "../assets/pages/avishkar/cards/Nirmaan_with_hover.webp";

import OligopolyWithoutHover from "../assets/pages/avishkar/cards/Oligopoly_without_hover.webp";
import OligopolyWithHover from "../assets/pages/avishkar/cards/Oligopoly_with_hover.webp";

import PowersurgeWithoutHover from "../assets/pages/avishkar/cards/Powersure_Without_hover.webp";
import PowersurgeWithHover from "../assets/pages/avishkar/cards/Powersure_With_hover.webp";

import RasayansWithoutHover from "../assets/pages/avishkar/cards/Rasayans_without_hover.webp";
import RasayansWithHover from "../assets/pages/avishkar/cards/Rasayans_with_hover.webp";

import RobomaniaWithoutHover from "../assets/pages/avishkar/cards/Robomania_Without_Hover.webp";
import RobomaniaWithHover from "../assets/pages/avishkar/cards/Robomania_With_Hover.webp";

import ButtonPlaque from "../assets/pages/avishkar/cards/ButtonCrop.webp";
import NexusDomainWithoutHover from "../assets/pages/avishkar/cards/nexus-domain-card-20261028-c.webp";
import NexusDomainWithHover from "../assets/pages/avishkar/cards/nexus-domain-card-20261028-d.webp";


function AvishkarEventCard({ event, onClick, eager, mobile }) {
  const cardImage = mobile ? event.withHover : event.withoutHover;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onPointerEnter={() => preloadPublicRoute(`/avishkar/${event.slug}`, { images: false })}
      onFocus={() => preloadPublicRoute(`/avishkar/${event.slug}`, { images: false })}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="group relative w-full max-w-[280px] sm:max-w-[360px] aspect-[2/3] cursor-pointer select-none transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] focus:outline-none rounded-lg"
    >
      {/* Mobile opens directly in colour because touch screens have no hover state. */}
      <img
        src={cardImage}
        alt={event.name}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{
          borderRadius: "2px",
          filter:
            "drop-shadow(0 12px 12px rgba(47, 24, 20, 0.45)) drop-shadow(0 24px 24px rgba(77, 39, 24, 0.24))",
        }}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        draggable={false}
      />

      {!mobile && (
        <img
          src={event.withHover}
          alt={`${event.name} Active`}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-out"
          loading="lazy"
          draggable={false}
        />
      )}

      {/* Event Title (Vertically aligned with the side laurel leaves at ~60%) */}
      <div className="absolute top-[58%] left-[8%] right-[8%] z-20 flex flex-col items-center justify-center pointer-events-none text-center">
        <h3
          className={`font-dalek sm:text-[22px] md:text-[21px] font-black uppercase text-[#2c153d] group-hover:text-[#431961] transition-colors drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] line-clamp-1 ${
            event.slug === "nexus-domain"
              ? "text-[15.5px] tracking-[0.08em] sm:tracking-[0.14em]"
              : "text-[18.5px] tracking-[0.14em]"
          }`}
        >
          {event.name}
        </h3>

        {/* Classical Flourish / Star Divider (Lowered down below title) */}
        <div className="flex items-center justify-center gap-2.5 w-36 sm:w-44 mt-1 text-[#7d5628]/70 group-hover:text-[#9e5518] transition-colors">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#7d5628] to-[#7d5628]" />
          <span className="text-[8px] sm:text-[10px]">✦</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#7d5628] to-[#7d5628]" />
        </div>
      </div>

      {/* Event Description (In the open parchment area below the title and divider) */}
      <div className="absolute top-[66%] left-[11%] right-[11%] bottom-[19%] z-20 flex items-center justify-center pointer-events-none text-center">
        <p className="font-garamond text-[13px] sm:text-[15px] font-semibold text-[#482d66] group-hover:text-[#28153d] transition-colors px-2 leading-relaxed line-clamp-3">
          {event.tagline}
        </p>
      </div>

      {/* Bottom Action Plaque Button (Enter Realm) */}
      <div className="absolute bottom-[9.5%] left-[17%] right-[17%] h-[8%] z-20 flex items-center justify-center pointer-events-none">
        {/* Hexagonal Button Plaque Graphic */}
        <img
          src={ButtonPlaque}
          alt=""
          className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03] drop-shadow-[0_4px_8px_rgba(40,15,65,0.35)]"
          draggable={false}
        />

        {/* Text inside Button: ENTER REALM ➔ */}
        <span className="relative z-10 font-cinzel text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#fbf5ea] group-hover:text-[#ffd977] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] flex items-center gap-1.5">
          <span>Enter Realm</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1 text-xs sm:text-sm">➔</span>
        </span>
      </div>
    </div>
  );
}

function AvishkarEvents() {
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
      id: "av0",
      name: "Nexus Domain",
      slug: "nexus-domain",
      tagline: "Technology, Strategy & Intelligent Innovation",
      withoutHover: NexusDomainWithoutHover,
      withHover: NexusDomainWithHover,
    },
    {
      id: "av1",
      name: "CyberQuest",
      slug: "cyberquest",
      tagline: "The Coding, Software & Algorithmic Arena",
      withoutHover: CyberquestWithoutHover,
      withHover: CyberquestWithHover,
    },
    {
      id: "av2",
      name: "Electromania",
      slug: "electromania",
      tagline: "Circuits, Silicon & Hardware Innovation",
      withoutHover: ElectromaniaWithoutHover,
      withHover: ElectromaniaWithHover,
    },
    {
      id: "av3",
      name: "Genesis",
      slug: "genesis",
      tagline: "The Conclave of Startups & Business Leadership",
      withoutHover: GenesisWithoutHover,
      withHover: GenesisWithHover,
    },
    {
      id: "av4",
      name: "Kreedomania",
      slug: "kreedomania",
      tagline: "Let the Competitive Digital Games Begin",
      withoutHover: KreedomaniaWithoutHover,
      withHover: KreedomaniaWithHover,
    },
    {
      id: "av5",
      name: "Mechaverse",
      slug: "mechaverse",
      tagline: "Mechanical CAD, Robotics & Automobile Design",
      withoutHover: MechrocosmWithoutHover,
      withHover: MechrocosmWithHover,
    },
    {
      id: "av6",
      name: "Monopoly",
      slug: "monopoly",
      tagline: "Financial Strategies & Market Economics",
      withoutHover: MonopolyWithoutHover,
      withHover: MonopolyWithHover,
    },
    {
      id: "av7",
      name: "Nirmaan",
      slug: "nirmaan",
      tagline: "Architectural Wonders & Civil Engineering Marvels",
      withoutHover: NirmaanWithoutHover,
      withHover: NirmaanWithHover,
    },
    {
      id: "av8",
      name: "Oligopoly",
      slug: "oligopoly",
      tagline: "Corporate Acumen, Case Studies & Strategic Dominance",
      withoutHover: OligopolyWithoutHover,
      withHover: OligopolyWithHover,
    },
    {
      id: "av9",
      name: "PowerSurge",
      slug: "powersurge",
      tagline: "Ignite the Spark of Electrical Power & High Voltage",
      withoutHover: PowersurgeWithoutHover,
      withHover: PowersurgeWithHover,
    },
    {
      id: "av10",
      name: "Rasayans",
      slug: "rasayans",
      tagline: "Industrial Chemistry & Process Engineering Unleashed",
      withoutHover: RasayansWithoutHover,
      withHover: RasayansWithHover,
    },
    {
      id: "av11",
      name: "Aeroverse",
      slug: "aeroverse",
      tagline: "Where Fluid Dynamics & Aerial Engineering Soar",
      withoutHover: AstrogynamixWithoutHover,
      withHover: AstrogynamixWithHover,
    },
    {
      id: "av12",
      name: "Cosmocon",
      slug: "cosmocon",
      tagline: "Astronomy, Astrophysics & Cosmic Exploration",
      withoutHover: CosmoconWithoutHover,
      withHover: CosmoconWithHover,
    },
    {
      id: "av13",
      name: "Robomania",
      slug: "robomania",
      tagline: "Combat Bot Wars, Maze Solvers & Autonomous Machines",
      withoutHover: RobomaniaWithoutHover,
      withHover: RobomaniaWithHover,
    },
    {
      id: "av14",
      name: "Gnosomania",
      slug: "gnosomania",
      tagline: "The Grand Knowledge, Trivia & Quizzing Pantheon",
      withoutHover: GnosomaniaWithoutHover,
      withHover: GnosomaniaWithHover,
    },
  ];
  const criticalAssetsReady = useImagePreloader(
    mobile ? mobileRouteCriticalImages["/avishkar"] : routeCriticalImages["/avishkar"],
  );

  if (!criticalAssetsReady) {
    return <RouteSuspenseLoader />;
  }

  return (
    <section
      className="relative min-h-screen w-full flex flex-col items-center justify-start text-white select-none"
      style={{
        backgroundImage: `url(${AvishkarBG})`,
        backgroundSize: "100% auto",
        backgroundPosition: "top center",
      }}
    >
      {/* Top Banner Group */}
      <div className="relative w-full overflow-hidden md:h-[300px] lg:h-[200px] sm:h-[300px] h-[450px] lg:mt-12 lg:mr-5">
        <div className="absolute inset-0 flex flex-col justify-center sm:px-8">
          <div className="w-full flex flex-col md:flex-row items-center justify-center md:gap-6">
            {/* Logo */}
            <div className="flex justify-center w-full md:w-1/3">
              <img
                src={image}
                className="w-75 sm:w-80 md:w-full max-w-[400px]"
                alt="Avishkar Crest"
              />
            </div>

          </div>
          <div className="w-full h-4"></div>
        </div>
      </div>

      {/* Grid of Avishkar Mythological Cards */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 lg:-mt-8 mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 lg:gap-14 justify-items-center">
          {events.map((event, index) => (
            <AvishkarEventCard
              key={event.id}
              event={event}
              eager={index < 3}
              mobile={mobile}
              onClick={() => navigate(`/avishkar/${event.slug}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AvishkarEvents;
