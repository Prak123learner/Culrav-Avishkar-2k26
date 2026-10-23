import React from "react";
import { useNavigate } from "react-router-dom";
import { RouteSuspenseLoader } from "../components/NavigationPortalLoader";
import { useImagePreloader } from "../components/useImagePreloader";
import { routeCriticalImages } from "../components/routeCriticalImages";
import { preloadPublicRoute } from "../components/publicRoutePreload";

import AvishkarBG from "../assets/common/backgrounds/AvishkarBG.webp";
import image from "../assets/pages/avishkar/avishkarrr-display.webp";

// Avishkar Greek Mythological Event Cards (Pairs: Without Hover & With Hover)
import AstrogynamixWithoutHover from "../assets/pages/avishkar/cards/Astrogynamix_without_hover.webp";
import AstrogynamixWithHover from "../assets/pages/avishkar/cards/Astrogynamix_with_hover.webp";

import AstrowingWithoutHover from "../assets/pages/avishkar/cards/Astrowing_without_hover.webp";
import AstrowingWithHover from "../assets/pages/avishkar/cards/Astrowing_with_hover.webp";

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


function AvishkarEventCard({ event, onClick, eager }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onPointerEnter={() => preloadPublicRoute(`/avishkar/${event.slug}`, { images: false })}
      onFocus={() => preloadPublicRoute(`/avishkar/${event.slug}`, { images: false })}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="group relative w-full max-w-[340px] sm:max-w-[360px] aspect-[2/3] cursor-pointer select-none transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] drop-shadow-[0_12px_28px_rgba(40,15,65,0.25)] hover:drop-shadow-[0_22px_45px_rgba(110,45,170,0.45)] focus:outline-none rounded-lg"
    >
      {/* Base Card: Without Hover Variant (Monochrome Imperial Purple) */}
      <img
        src={event.withoutHover}
        alt={event.name}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none rounded-lg avishkar-card-stone"
        style={{
          clipPath: "inset(4.7% 2.8% 4.7% 2.3% round 8px)",
          WebkitClipPath: "inset(4.7% 2.8% 4.7% 2.3% round 8px)",
        }}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        draggable={false}
      />

      {/* Hover Card: With Hover Variant (Blooms to Full Radiant Color) */}
      <img
        src={event.withHover}
        alt={`${event.name} Active`}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-out rounded-lg avishkar-card-stone"
        style={{
          clipPath: "inset(4.7% 2.8% 4.7% 2.3% round 8px)",
          WebkitClipPath: "inset(4.7% 2.8% 4.7% 2.3% round 8px)",
        }}
        loading="lazy"
        draggable={false}
      />

      {/* Event Title (Vertically aligned with the side laurel leaves at ~60%) */}
      <div className="absolute top-[58%] left-[8%] right-[8%] z-20 flex flex-col items-center justify-center pointer-events-none text-center">
        <h3 className="font-dalek text-lg sm:text-xl md:text-2xl font-black uppercase tracking-[0.16em] text-[#2c153d] group-hover:text-[#431961] transition-colors drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] line-clamp-1">
          {event.name}
        </h3>

        {/* Classical Flourish / Star Divider (Lowered down below title) */}
        <div className="flex items-center justify-center gap-2.5 w-36 sm:w-44 mt-2 sm:mt-1 text-[#7d5628]/70 group-hover:text-[#9e5518] transition-colors">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#7d5628] to-[#7d5628]" />
          <span className="text-[8px]">✦</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#7d5628] to-[#7d5628]" />
        </div>
      </div>

      {/* Event Description (In the open parchment area below the title and divider) */}
      <div className="absolute top-[66%] left-[11%] right-[11%] bottom-[19%] z-20 flex items-center justify-center pointer-events-none text-center">
        <p className="font-garamond text-xs sm:text-sm font-semibold text-[#482d66] group-hover:text-[#28153d] transition-colors px-2 leading-relaxed line-clamp-3">
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
        <span className="relative z-10 font-cinzel text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#fbf5ea] group-hover:text-[#ffd977] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] flex items-center gap-1.5">
          <span>Enter Realm</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1 text-[11px] sm:text-xs">➔</span>
        </span>
      </div>
    </div>
  );
}

function AvishkarEvents() {
  const navigate = useNavigate();

  const events = [
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
      name: "Mechrocosm",
      slug: "mechrocosm",
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
      name: "Aerodynamix",
      slug: "aerodynamix",
      tagline: "Where Fluid Dynamics & Aerial Engineering Soar",
      withoutHover: AstrogynamixWithoutHover,
      withHover: AstrogynamixWithHover,
    },
    {
      id: "av12",
      name: "Astrowing",
      slug: "astrowing",
      tagline: "Explore the Cosmos, Astrophotography & the Universe",
      withoutHover: AstrowingWithoutHover,
      withHover: AstrowingWithHover,
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
  const criticalAssetsReady = useImagePreloader(routeCriticalImages["/avishkar"]);

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

            {/* Description */}
            <div className="w-full md:w-2/3 flex justify-center">
              <p className="font-garamond p-6 text-center text-base font-medium leading-relaxed text-[#fff2dc] drop-shadow-[0_2px_8px_rgba(18,7,35,0.9)] sm:text-lg max-w-2xl">
                Where ancient wisdom meets modern innovation. From hackathons to robotic battles, challenge the limits of possibility, forge bold ideas, and rise among the legends of tomorrow.
              </p>
            </div>
          </div>
          <div className="w-full h-4"></div>
        </div>
      </div>

      {/* Grid of Avishkar Mythological Cards */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 lg:gap-14 justify-items-center">
          {events.map((event, index) => (
            <AvishkarEventCard
              key={event.id}
              event={event}
              eager={index < 3}
              onClick={() => navigate(`/avishkar/${event.slug}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AvishkarEvents;
