import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { PortalLoading } from "../portal/PortalLoading";

export const ROUTE_MAP = {
  "/": {
    label: "Entering the Grand Citadel",
    subtext: "Approaching the Sacred Confluence of Culrav & Avishkar",
    kicker: "Convocatio MMXXVI",
  },
  "/culrav": {
    label: "Entering Realm of Culrav",
    subtext: "Awakening the Cultural Arena of Art, Melody & Celebration",
    kicker: "Culrav Arena · MMXXVI",
  },
  "/avishkar": {
    label: "Entering Realm of Avishkar",
    subtext: "Opening the Technical Pantheon of Invention & Intellect",
    kicker: "Avishkar Pantheon · MMXXVI",
  },
  "/gallery": {
    label: "Entering the Hall of Memories",
    subtext: "Unfolding the Sacred Chronicles of Triumphs & Celebrations",
    kicker: "Festival Chronicles · MMXXVI",
  },
  "/team": {
    label: "Consulting the Archon Council",
    subtext: "Summoning the Coordinators & Stewards of the Dual Realms",
    kicker: "Archon Council · MMXXVI",
  },
  "/sponsors": {
    label: "Entering Festival Patrons",
    subtext: "The Sovereign Titan Alliances Shall Soon Be Revealed",
    kicker: "Sacrae Alliances · MMXXVI",
  },
  "/schedule": {
    label: "Consulting the Festival Ephemeris",
    subtext: "Charting the Sequences of Conquests & Pro-Nites",
    kicker: "Conclave Chronology · MMXXVI",
  },
  "/login": {
    label: "Entering Participant Sanctuary",
    subtext: "Verifying Inscribed Credentials & Citadel Access",
    kicker: "Traveler Access · MMXXVI",
  },
  "/portal": {
    label: "Entering Participant Workspace",
    subtext: "Accessing Team Registrations & Event Submissions",
    kicker: "Participant Portal · MMXXVI",
  },
  "/coordinator": {
    label: "Entering Coordinator Chambers",
    subtext: "Consulting Staff Registries & Event Operations",
    kicker: "Staff Command · MMXXVI",
  },
  "/coordinator/login": {
    label: "Entering Coordinator Gate",
    subtext: "Verifying Archon Authentication",
    kicker: "Staff Command · MMXXVI",
  },
  "/admin": {
    label: "Entering High Archon Sanctum",
    subtext: "Accessing Central System Administration",
    kicker: "Imperial Command · MMXXVI",
  },
  "/admin/login": {
    label: "Entering High Archon Gate",
    subtext: "Verifying Administrative Privileges",
    kicker: "Imperial Command · MMXXVI",
  },
  "/coming-soon": {
    label: "Registration Form Pending",
    subtext: "The Inscription Scroll for This Event Opens Soon",
    kicker: "Convocatio MMXXVI",
  },
};

// Subevent names mapping
const CULRAV_SUBEVENTS = {
  anunaad: { label: "Entering Anunaad Arena", subtext: "The Symphony of Classical, Eastern & Rock Melodies" },
  darkroom: { label: "Entering Darkroom Arena", subtext: "The Visual Art of Cinematography & Photography" },
  rangmanch: { label: "Entering Rangmanch Arena", subtext: "The Thespian Stage of Dramatic Plays & Monologues" },
  litmuse: { label: "Entering Litmuse Arena", subtext: "The Literary Forum of Poetry Slams, Debates & Elocution" },
  rangsazzi: { label: "Entering Rangsaazi Arena", subtext: "The Fine Arts Canvas of Brushwork, Sculpting & Color" },
  spandan: { label: "Entering Spandan Arena", subtext: "The Runway of Haute Couture, Fashion & Elegance" },
  razzmatazz: { label: "Entering Razzmatazz Arena", subtext: "The Choreography Arena of Western, Classical & Street Dance" },
};

const AVISHKAR_SUBEVENTS = {
  cyberquest: { label: "Entering CyberQuest Pantheon", subtext: "Algorithmic Code Battles, Web & AI Architectures" },
  genesis: { label: "Entering Genesis Pantheon", subtext: "Bio-Engineering Discoveries & Genetics Conclave" },
  electromania: { label: "Entering Electromania Pantheon", subtext: "Silicon Circuit Mastery & Embedded Hardware" },
  kreedomania: { label: "Entering Kreedomania Pantheon", subtext: "Cyber Athletics & Strategic Esports Arenas" },
  mechrocosm: { label: "Entering Mechrocosm Pantheon", subtext: "Automotive Precision, CAD & Mechanical Dynamics" },
  monopoly: { label: "Entering Monopoly Pantheon", subtext: "Financial Mastery, Stock Markets & Crypto Exchanges" },
  nirmaan: { label: "Entering Nirmaan Pantheon", subtext: "Structural Engineering & Architectural Blueprints" },
  oligopoly: { label: "Entering Oligopoly Pantheon", subtext: "Strategic Case Studies & Corporate Leadership" },
  powersurge: { label: "Entering PowerSurge Pantheon", subtext: "High-Voltage Power Systems & Clean Energy" },
  rasayans: { label: "Entering Rasayans Pantheon", subtext: "Industrial Process Engineering & Chemical Syntheses" },
  aerodynamix: { label: "Entering Aerodynamix Pantheon", subtext: "Unmanned Aerial Systems & Fluid Mechanics" },
  astrowing: { label: "Entering Astrowing Pantheon", subtext: "Cosmic Astrophotography & Planetary Observations" },
  robomania: { label: "Entering Robomania Pantheon", subtext: "Combat Bot Wars, Maze Explorers & Autonomous Bots" },
  gnosomania: { label: "Entering Gnosomania Pantheon", subtext: "The Grand Knowledge & Trivia Pantheon" },
};

export function getRouteDetails(pathname) {
  if (!pathname) return ROUTE_MAP["/"];

  const cleanPath = pathname.toLowerCase().replace(/\/$/, "") || "/";

  // Exact match
  if (ROUTE_MAP[cleanPath]) {
    return ROUTE_MAP[cleanPath];
  }

  // Culrav subevents
  if (cleanPath.startsWith("/culrav/")) {
    const slug = cleanPath.replace("/culrav/", "");
    if (CULRAV_SUBEVENTS[slug]) {
      return {
        label: CULRAV_SUBEVENTS[slug].label,
        subtext: CULRAV_SUBEVENTS[slug].subtext,
        kicker: "Culrav Cultural Arena · MMXXVI",
      };
    }
    const title = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
      label: `Entering ${title} Arena`,
      subtext: "The Cultural Realm of Passion, Music & Drama",
      kicker: "Culrav Cultural Arena · MMXXVI",
    };
  }

  // Avishkar subevents
  if (cleanPath.startsWith("/avishkar/")) {
    const slug = cleanPath.replace("/avishkar/", "");
    if (AVISHKAR_SUBEVENTS[slug]) {
      return {
        label: AVISHKAR_SUBEVENTS[slug].label,
        subtext: AVISHKAR_SUBEVENTS[slug].subtext,
        kicker: "Avishkar Tech Pantheon · MMXXVI",
      };
    }
    const title = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
      label: `Entering ${title} Pantheon`,
      subtext: "The Technical Realm of Invention & Code",
      kicker: "Avishkar Tech Pantheon · MMXXVI",
    };
  }

  // Portal sub-routes
  if (cleanPath.startsWith("/portal/events/")) {
    return {
      label: "Opening Event Inscription",
      subtext: "Consulting Rulebook, Team Requirements & Submission Gates",
      kicker: "Registration Sanctuary · MMXXVI",
    };
  }

  // Default fallback
  return {
    label: "Opening the Festival Archives",
    subtext: "Consulting the Festival Archives",
    kicker: "Culrav × Avishkar MMXXVI",
  };
}

/**
 * TabTransitionLoader
 * Renders an ancient portal overlay when navigating between tabs/routes.
 */
export function TabTransitionLoader() {
  const location = useLocation();
  const [transitionState, setTransitionState] = useState({
    active: false,
    leaving: false,
    details: getRouteDetails(location.pathname),
  });

  const previousPathRef = useRef(location.pathname);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    // Avoid double loader on initial mount (where initial reveal covers loading)
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      previousPathRef.current = location.pathname;
      return;
    }

    // Only trigger when pathname actually changes
    if (previousPathRef.current === location.pathname) {
      return;
    }

    previousPathRef.current = location.pathname;
    const details = getRouteDetails(location.pathname);

    setTransitionState({
      active: true,
      leaving: false,
      details,
    });

    // Reset scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Keep enough time for the seal to register without delaying the destination.
    const leaveTimer = setTimeout(() => {
      setTransitionState((prev) => ({ ...prev, leaving: true }));
    }, 320);

    // Complete transition after smooth 280ms fade out
    const endTimer = setTimeout(() => {
      setTransitionState((prev) => ({ ...prev, active: false }));
    }, 520);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(endTimer);
    };
  }, [location.pathname]);

  if (!transitionState.active) return null;

  return (
    <PortalLoading
      overlay
      isLeaving={transitionState.leaving}
      label={transitionState.details.label}
      subtext={transitionState.details.subtext}
      kicker={transitionState.details.kicker}
    />
  );
}

/**
 * RouteSuspenseLoader
 * Fallback for React.Suspense when a lazy-loaded route chunk is downloading.
 */
export function RouteSuspenseLoader() {
  const location = useLocation();
  const details = getRouteDetails(location.pathname);

  return (
    <PortalLoading
      label={details.label}
      subtext={details.subtext}
      kicker={details.kicker}
    />
  );
}
