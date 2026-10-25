import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import CardTeam from "../components/General/CardTeam";
import { teamData } from "../data/Team/data.js";
import { RouteSuspenseLoader } from "../components/NavigationPortalLoader";
import { useImagePreloader } from "../components/useImagePreloader";
import { routeCriticalImages, teamFirstPortraits } from "../components/routeCriticalImages";

const TEAM_CRITICAL_PORTRAITS = teamFirstPortraits;

// Classical Greek Laurel Divider
const LaurelDivider = () => (
  <div className="flex items-center justify-center gap-2 text-[#8c6536]">
    <svg
      viewBox="0 0 80 30"
      className="h-5 w-14 rotate-180"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5,15 Q40,5 75,15" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M60,13 Q68,6 74,12 Q66,16 60,13 Z" />
      <path d="M48,11 Q56,4 62,10 Q54,14 48,11 Z" />
      <path d="M36,9 Q44,2 50,8 Q42,12 36,9 Z" />
      <path d="M24,7 Q32,0 38,6 Q30,10 24,7 Z" />
      <path d="M52,19 Q58,26 64,20 Q58,16 52,19 Z" />
      <path d="M40,17 Q46,24 52,18 Q46,14 40,17 Z" />
      <path d="M28,15 Q34,22 40,16 Q34,12 28,15 Z" />
    </svg>
    <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-current" />
    <svg
      viewBox="0 0 80 30"
      className="h-5 w-14"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5,15 Q40,5 75,15" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M60,13 Q68,6 74,12 Q66,16 60,13 Z" />
      <path d="M48,11 Q56,4 62,10 Q54,14 48,11 Z" />
      <path d="M36,9 Q44,2 50,8 Q42,12 36,9 Z" />
      <path d="M24,7 Q32,0 38,6 Q30,10 24,7 Z" />
      <path d="M52,19 Q58,26 64,20 Q58,16 52,19 Z" />
      <path d="M40,17 Q46,24 52,18 Q46,14 40,17 Z" />
      <path d="M28,15 Q34,22 40,16 Q34,12 28,15 Z" />
    </svg>
  </div>
);

const groupMembersByRole = (members) =>
  members.reduce((groups, member) => {
    const role = member.role || "Council";
    groups[role] = [...(groups[role] || []), member];
    return groups;
  }, {});

export function TeamPage() {
  const [activeSection, setActiveSection] = useState(teamData[0].id);
  const activeSectionRef = useRef(activeSection);
  activeSectionRef.current = activeSection;
  const mainContentRef = useRef(null);
  const sectionRefs = useRef({});
  const isClickScrolling = useRef(false);
  const scrollTimeout = useRef(null);
  const criticalPortraitsReady = useImagePreloader(routeCriticalImages["/team"]);

  // Scroll-spy logic (dynamic viewport measurement via requestAnimationFrame)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (isClickScrolling.current || ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (isClickScrolling.current) return;

        // Check if user has reached the very bottom of the page
        const lastTeam = teamData[teamData.length - 1];
        const lastEl = lastTeam ? sectionRefs.current[lastTeam.id] : null;
        const isAtBottom =
          lastEl &&
          lastEl.getBoundingClientRect().top < window.innerHeight &&
          Math.ceil(window.innerHeight + window.scrollY) >=
            document.documentElement.scrollHeight - 20;

        if (isAtBottom) {
          const lastId = lastTeam.id;
          if (lastId !== activeSectionRef.current) {
            activeSectionRef.current = lastId;
            setActiveSection(lastId);
          }
          return;
        }

        const headerOffset = 140;
        let currentSection = teamData[0]?.id || "";

        for (const team of teamData) {
          const el = sectionRefs.current[team.id];
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerOffset) {
            currentSection = team.id;
          }
        }

        if (currentSection && currentSection !== activeSectionRef.current) {
          activeSectionRef.current = currentSection;
          setActiveSection(currentSection);
        }
      });
    };

    const handleUserInteraction = () => {
      if (isClickScrolling.current) {
        isClickScrolling.current = false;
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    window.addEventListener("wheel", handleUserInteraction, { passive: true });
    window.addEventListener("touchmove", handleUserInteraction, { passive: true });
    window.addEventListener("scrollend", handleUserInteraction, { passive: true });

    // Initial check on mount
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("wheel", handleUserInteraction);
      window.removeEventListener("touchmove", handleUserInteraction);
      window.removeEventListener("scrollend", handleUserInteraction);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [criticalPortraitsReady]);

  const handleNavClick = (id) => {
    const sectionEl = sectionRefs.current[id];
    if (sectionEl) {
      activeSectionRef.current = id;
      setActiveSection(id);
      isClickScrolling.current = true;

      // On mobile screens, both the fixed navbar (64px) and the sticky dropdown (~50px)
      // occupy the top 114px of the viewport, so offset by 128px for clean breathing room.
      const offset = typeof window !== "undefined" && window.innerWidth < 768 ? 128 : 85;
      const y = sectionEl.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: y,
        behavior: "smooth",
      });

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isClickScrolling.current = false;
      }, 800);
    }
  };

  const handleMobileNavChange = (e) => {
    handleNavClick(e.target.value);
  };

  if (!criticalPortraitsReady) {
    return <RouteSuspenseLoader />;
  }

  return (
    <div className="relative min-h-screen w-full bg-[#edd8b1] text-[#2c1d0c] pt-16 select-none">
      {/* High-Resolution Ancient Parchment Background */}
      <div
        style={{ transform: "translateZ(0)" }}
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      >
        <img
          src="/media/common/textures/parchment-bg-20261026.webp"
          alt="Ancient Parchment"
          className="w-full h-full object-cover object-center opacity-90"
        />
        {/* Soft warm vignette & lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#edd8b1]/60 via-transparent to-[#e8d2a6]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(60,35,15,0.18)_100%)]" />
      </div>

      {/* --- Desktop Sidebar (Sacred Council Directory) --- */}
      <aside
        style={{ transform: "translateZ(0)" }}
        className="hidden md:flex flex-col w-64 lg:w-72 h-[calc(100vh-4rem)] fixed left-0 top-16 bg-[#160b04]/95 backdrop-blur-md border-r-2 border-[#b58b4f]/60 z-20 shadow-[4px_0_25px_rgba(20,10,4,0.35)]"
      >

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {teamData.map((team) => {
            const isActive = activeSection === team.id;
            return (
              <button
                key={team.id}
                onClick={() => handleNavClick(team.id)}
                className={`group relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-sm font-cinzel text-xs font-bold uppercase tracking-wider transition-all duration-200 text-left cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#381f0d] to-[#251509] text-[#f3cf8a] border-l-4 border-[#c4681f] border-y border-r border-[#b88c4b]/50 shadow-sm pl-4"
                    : "text-[#d4b48d] hover:text-[#f3cf8a] hover:bg-[#28160a]/80 hover:pl-4 border-l-4 border-transparent"
                }`}
              >
                <span className="truncate pr-2">{team.name}</span>
                {isActive ? (
                  <span className="text-[#f3cf8a] text-xs shrink-0">✦</span>
                ) : (
                  <span className="text-[10px] text-[#8c6536] shrink-0 group-hover:text-[#d4a259]">
                    {team.members.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* --- Mobile Dropdown Navigation --- */}
      <div className="md:hidden sticky top-16 inset-x-0 z-30 bg-[#160b04]/95 backdrop-blur-md border-b-2 border-[#b58b4f]/70 px-4 py-2.5 shadow-md">
        <div className="relative">
          <select
            value={activeSection}
            onChange={handleMobileNavChange}
            className="w-full appearance-none bg-[#241408] border border-[#b58b4f]/60 text-[#f7eedc] font-cinzel font-bold tracking-wider text-xs p-3 rounded-sm focus:outline-none focus:border-[#f3cf8a]"
          >
            {teamData.map((team) => (
              <option key={team.id} value={team.id} className="bg-[#1e1006] text-[#f7eedc]">
                {team.name} ({team.members.length})
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#f3cf8a] pointer-events-none"
          />
        </div>
      </div>

      {/* --- Main Content (Full Page Scrolling) --- */}
      <main
        ref={mainContentRef}
        className="relative w-full min-h-screen md:pl-64 lg:pl-72 pt-4 md:pt-6 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-24">
          {/* Masthead Header */}
          <div className="mb-12 pt-6 text-center">
            <div className="my-2 flex select-none flex-col items-center justify-center">
              <div className="flex w-full max-w-xl items-center justify-center gap-3 px-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8c6536] to-[#8c6536]" />
                <div className="font-cinzel flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#7d5628]">
                  <span>✦</span>
                  <span>The Sacred Conclave</span>
                  <span>✦</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8c6536] to-[#8c6536]" />
              </div>
              <span className="font-cinzel mt-1 text-[11px] uppercase tracking-[0.24em] text-[#876233]">
                Culrav Avishkar 2026
              </span>
            </div>
          </div>

          {/* Council Sections */}
          {teamData.map((team) => (
            <section
              key={team.id}
              id={team.id}
              ref={(el) => (sectionRefs.current[team.id] = el)}
              className="mb-16 scroll-mt-24"
            >
              {/* Section Heading with Classical Greek Lineage */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-2.5 border-b-2 border-[#b58b4f]/40">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#a85a18] text-sm">✦</span>
                  <h2 className="font-cinzel text-xl sm:text-2xl font-black uppercase tracking-[0.14em] text-[#2c1d0c]">
                    {team.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-[#7d5628] font-cinzel text-[11px] uppercase tracking-[0.2em] font-semibold">
                  <span>✦</span>
                  <span>
                    {team.members.length} {team.members.length === 1 ? "Archon" : "Archons"}
                  </span>
                </div>
              </div>

              {/* Classical Medallion Portrait Grid */}
              {team.members.some((member) => member.role) ? (
                <div className="space-y-10">
                  {Object.entries(groupMembersByRole(team.members))
                    .sort(([firstRole], [secondRole]) => firstRole.localeCompare(secondRole))
                    .map(([role, members]) => (
                    <div key={role}>
                      <h3 className="mb-4 border-l-2 border-[#a85a18] pl-3 font-cinzel text-sm font-bold uppercase tracking-[0.16em] text-[#70401d]">{role}</h3>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
                        {[...members]
                          .sort((firstMember, secondMember) => firstMember.name.localeCompare(secondMember.name))
                          .map((member) => <CardTeam key={member.name} name={member.name} img={member.img} role={member.role} instagram={member.instagram} eager={TEAM_CRITICAL_PORTRAITS.includes(member.img)} />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
                  {team.members.map((member) => <CardTeam key={member.name} name={member.name} img={member.img} instagram={member.instagram} eager={TEAM_CRITICAL_PORTRAITS.includes(member.img)} />)}
                </div>
              )}
            </section>
          ))}

          {/* Imperial Footer Plinth inside Scrollable Area */}
          <div className="mt-16 pt-8 border-t-2 border-[#b58b4f]/40 flex flex-col items-center justify-center text-center pb-8">
            <span className="font-cinzel text-[11px] font-bold tracking-[0.3em] uppercase text-[#7d5628] flex items-center gap-2">
              <span>✦</span>
              <span>Echoes of Olympus</span>
              <span>✦</span>
            </span>
            <p className="font-garamond italic text-sm text-[#5e3f20] mt-1">
              Two realms. One stage. Culrav Avishkar 2026.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeamPage;
