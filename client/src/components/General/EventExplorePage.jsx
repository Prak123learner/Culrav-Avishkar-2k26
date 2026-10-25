import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { EventRegistrationLink } from "../../portal/EventRegistrationLink";
import AvishkarBG from "../../assets/common/backgrounds/AvishkarBG.webp";
import CulravBG from "../../assets/common/backgrounds/CulravBG.webp";

const Motion = motion;

export default function EventExplorePage({
  data,
  festival = "avishkar",
  category = "",
}) {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const isCulrav = festival === "culrav";
  const bgImage = isCulrav ? CulravBG : AvishkarBG;
  const festivalName = isCulrav ? "Culrav 2026" : "Avishkar 2026";
  const parentPath = isCulrav ? "/culrav" : "/avishkar";
  const categoryTitle = data.categoryName || data.eventName || "Events";
  const tagline = data.tagline || "";
  const catSlug = data.categorySlug || category;

  const accentHoverText = isCulrav ? "hover:text-[#96380c]" : "hover:text-[#63264f]";
  const accentHoverBorder = isCulrav ? "hover:border-[#96380c]" : "hover:border-[#8e4873]";
  const arrowColor = isCulrav ? "text-[#96380c]" : "text-[#63264f]";

  // Normalize event list
  const events = (data.events || []).map((ev, index) => {
    const title = ev.eventName || ev.name || `Contest ${index + 1}`;
    const desc = Array.isArray(ev.desc)
      ? ev.desc.join("\n\n")
      : ev.description ||
        ev.desc ||
        "Details and problem statements will be revealed by the council.";
    const rules = Array.isArray(ev.rules) ? ev.rules : [];
    const coordinators = ev.coordinators || ev.coords || [];
    return {
      id: ev.eventId || ev.id || ev.fixedKey || index,
      title,
      description: desc,
      rules,
      coordinators,
      raw: ev,
    };
  });

  // Handle ESC key to close explore modal
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Prevent background scroll when explore panel is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <div
      className="min-h-screen w-full relative text-[#241104] overflow-x-hidden select-none font-sans"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Sunlit Olympian ambient atmospheric veil that lets temple artwork breathe */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#fcf7ee]/60 via-[#f8f0e1]/45 to-[#f2e5d0]/65 z-0" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-28">
        {/* Navigation Actions Row: Back to Festival Hub & Cross Exit Button */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(parentPath)}
            className={`group inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-2 border-2 border-[#b88c4b]/80 bg-[#fffdf8]/90 hover:bg-[#faeed3] ${accentHoverBorder} text-[#2c1305] ${accentHoverText} font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.18em] shadow-[0_3px_12px_rgba(70,35,10,0.12)] hover:shadow-[0_5px_18px_rgba(150,56,12,0.25)] transition-all rounded-xs cursor-pointer select-none`}
            title={`Back to ${festivalName}`}
          >
            <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${arrowColor}`} />
            <span>Back to {isCulrav ? "Culrav" : "Avishkar"}</span>
          </button>
        </div>

        {/* Masthead Header */}
        <header className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-[0.12em] text-[#241104] drop-shadow-[0_2px_8px_rgba(255,255,255,0.85)]">
            {categoryTitle}
          </h1>

          {/* Classical Laurel Divider */}
          <div className="flex items-center justify-center gap-3 mt-4 text-[#8c6536]">
            <div className="h-px w-20 sm:w-32 bg-gradient-to-r from-transparent via-[#8c6536] to-[#8c6536]" />
            <span className="text-xs">✦</span>
            <div className="h-px w-20 sm:w-32 bg-gradient-to-l from-transparent via-[#8c6536] to-[#8c6536]" />
          </div>

          {tagline ? (
            <p className="font-garamond italic text-base sm:text-lg text-[#5d381c] font-semibold max-w-2xl mx-auto leading-relaxed mt-3">
              {tagline}
            </p>
          ) : null}
        </header>

        {/* Sub-Events Cards Grid (Authentic Warm Parchment Tablets - Compact Sleek Height) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {events.map((event, idx) => (
            <Motion.div
              key={event.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.28 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelected(event)}
              className="group relative flex flex-col justify-between overflow-hidden border-2 border-[#b88c4b]/80 hover:border-[#96380c] hover:shadow-[0_14px_34px_rgba(150,56,12,0.28)] px-5 py-3.5 sm:px-6 sm:py-4 shadow-[0_8px_22px_rgba(60,30,8,0.16)] transition-all duration-300 cursor-pointer select-none"
              style={{
                backgroundImage: "url('/media/common/textures/parchment-bg.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Soft luminous warm veil to preserve parchment fiber vibrancy */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#fffaf0]/60 via-[#faeed6]/30 to-[#f5dfbe]/70 pointer-events-none" />

              {/* Classical Inner Fillet Border */}
              <div className="pointer-events-none absolute inset-1.5 border border-[#b88c4b]/40 group-hover:border-[#96380c]/60 transition-colors" />

              {/* Classical Corner Stars */}
              <div className="pointer-events-none absolute top-1.5 left-1.5 text-[7px] text-[#b88c4b] group-hover:text-[#96380c] transition-colors">
                ✦
              </div>
              <div className="pointer-events-none absolute top-1.5 right-1.5 text-[7px] text-[#b88c4b] group-hover:text-[#96380c] transition-colors">
                ✦
              </div>
              <div className="pointer-events-none absolute bottom-1.5 left-1.5 text-[7px] text-[#b88c4b] group-hover:text-[#96380c] transition-colors">
                ✦
              </div>
              <div className="pointer-events-none absolute bottom-1.5 right-1.5 text-[7px] text-[#b88c4b] group-hover:text-[#96380c] transition-colors">
                ✦
              </div>

              {/* Event Title (Original Color) */}
              <div className="relative z-10 flex flex-col justify-between flex-grow">
                <div className="py-1 sm:py-1.5 text-center flex flex-col items-center justify-center min-h-[2.8rem] sm:min-h-[3.2rem]">
                  <h2 className="font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#241104] group-hover:text-[#96380c] transition-colors leading-snug drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
                    {event.title}
                  </h2>
                </div>

                {/* Card Bottom: Explore Action (#471E39 for Avishkar, #992510 for Culrav) */}
                <div className="mt-2.5 pt-2 border-t border-[#b88c4b]/35">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(event);
                    }}
                    className={`w-full py-1.5 sm:py-2 px-3.5 flex items-center justify-center gap-2 border font-cinzel text-[11px] sm:text-xs font-black uppercase tracking-[0.18em] transition-all cursor-pointer ${
                      isCulrav
                        ? "border-[#dfa255] bg-gradient-to-r from-[#992510] via-[#b33118] to-[#801c0a] text-[#fffef8] shadow-[0_3px_10px_rgba(153,37,16,0.35)] group-hover:from-[#ab2d14] group-hover:to-[#992510] group-hover:border-[#ffd977] group-hover:shadow-[0_5px_18px_rgba(179,49,24,0.5)]"
                        : "border-[#8e4873] bg-gradient-to-r from-[#471E39] via-[#5d274c] to-[#39182d] text-[#fffef8] shadow-[0_3px_10px_rgba(71,30,57,0.4)] group-hover:from-[#5b264a] group-hover:to-[#471E39] group-hover:border-[#ffd977] group-hover:shadow-[0_5px_18px_rgba(93,39,76,0.55)]"
                    }`}
                  >
                    <span>Explore</span>
                    <span className="transition-transform group-hover:translate-x-1.5">
                      ➔
                    </span>
                  </button>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      </div>

      {/* --- Subevent Explore Page (Full-Screen Slide-Up Warm Parchment Panel Extending Behind Navbar) --- */}
      <AnimatePresence>
        {selected && (
          <Motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 overflow-y-auto bg-[#ebd5ab] text-[#241104] select-none"
            data-lenis-prevent
          >
            {/* High-Resolution Ancient Parchment Background (100% Solid & Opaque - Full Page Behind Navbar) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
              <img
                src="/media/common/textures/parchment-bg.webp"
                alt="Ancient Parchment"
                className="w-full h-full object-cover object-center opacity-100"
              />
              {/* Soft warm sunlit vignette & classical ambient lighting */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#fbf4e4]/30 via-transparent to-[#edd8b3]/40" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(90,45,15,0.12)_100%)]" />
            </div>

            {/* Classical architectural border frame (starts below navbar) */}
            <div className="pointer-events-none fixed inset-x-3 sm:inset-x-5 top-20 bottom-3 sm:bottom-5 border-2 border-[#b88c4b]/35 z-10" />

            {/* Modal Top-Left Back Button */}
            <Motion.button
              type="button"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              onClick={() => setSelected(null)}
              className={`fixed top-20 left-6 sm:left-10 z-50 inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 border-2 border-[#b88c4b]/80 bg-[#fffdf8] hover:bg-[#faeed3] ${accentHoverBorder} text-[#2c1305] ${accentHoverText} font-cinzel text-xs font-bold uppercase tracking-[0.16em] cursor-pointer shadow-[0_4px_16px_rgba(70,35,10,0.18)] hover:shadow-[0_6px_22px_rgba(150,56,12,0.32)] rounded-xs`}
              aria-label={`Back to ${categoryTitle}`}
            >
              <ArrowLeft className={`w-4 h-4 ${arrowColor}`} />
              <span className="hidden sm:inline">Back to {categoryTitle}</span>
              <span className="sm:hidden">Back</span>
            </Motion.button>

            

            {/* Explore Page Header (padded top to start comfortably below the 64px navbar) */}
            <div className="relative z-10 text-center max-w-5xl mx-auto px-4 pt-24 sm:pt-28 mb-8 sm:mb-12">
              <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[0.11em] text-[#241104] drop-shadow-[0_2px_4px_rgba(255,248,230,0.8)] my-2">
                {selected.title}
              </h1>
              <div className="flex items-center justify-center gap-3 mt-3 text-[#b88c4b]">
                <div className="h-px w-20 sm:w-36 bg-gradient-to-r from-transparent via-[#b88c4b] to-[#b88c4b]" />
                <span className="text-xs">✦</span>
                <div className="h-px w-20 sm:w-36 bg-gradient-to-l from-transparent via-[#b88c4b] to-[#b88c4b]" />
              </div>
            </div>

            {/* 2-Column Sequential Layout across wide screen (Left: About & Rules, Right: Coordinators POC) */}
            <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 mb-24 pb-20">
              {/* Left Column: About the Event & Rules (Sequential, Open Editorial Flow - NO BOXES, NO DIVIDER LINE) */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
                {/* About the Event (Unboxed - Original Colors) */}
                <section className="flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[#b84218] text-sm">
                      ✦
                    </span>
                    <h2 className="font-cinzel text-2xl sm:text-3xl font-black uppercase tracking-[0.11em] text-[#241104]">
                      About the Event
                    </h2>
                  </div>
                  <div className="h-0.5 w-24 bg-gradient-to-r from-[#b88c4b] via-[#c96020] to-transparent mb-5" />

                  <div className="font-garamond text-lg sm:text-xl text-[#2b1406] font-medium leading-relaxed whitespace-pre-line">
                    {selected.description}
                  </div>
                </section>

                {/* Rules (Unboxed, Sequential with Diamond Bullets - Original Colors) */}
                <section className="flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[#b84218] text-sm">
                      ✦
                    </span>
                    <h2 className="font-cinzel text-2xl sm:text-3xl font-black uppercase tracking-[0.11em] text-[#241104]">
                      Rules
                    </h2>
                  </div>
                  <div className="h-0.5 w-24 bg-gradient-to-r from-[#b88c4b] via-[#c96020] to-transparent mb-5" />

                  <div>
                    {selected.rules && selected.rules.length > 0 ? (
                      <ul className="space-y-4 font-garamond text-lg sm:text-xl text-[#2b1406]">
                        {selected.rules.map((rule, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3.5 leading-relaxed"
                          >
                            <span className="text-[#b84218] text-sm shrink-0 mt-1 select-none">
                              ✦
                            </span>
                            <span className="font-medium text-[#241104]">
                              {rule}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-garamond italic text-lg text-[#663b1b]">
                        Standard festival regulations apply. Specific guidelines
                        will be briefed by the event coordinators.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column: Coordinators POC (Right-Aligned, Ornate Stone Cartouche - Original Colors) */}
              <div className="lg:col-span-5 xl:col-span-4 flex justify-end">
                <div className="w-full lg:max-w-md lg:sticky lg:top-28">
                  <div
                    className="relative p-6 sm:p-7 border-2 border-[#b88c4b]/80 shadow-[0_12px_32px_rgba(70,35,10,0.18)] flex flex-col"
                    style={{
                      backgroundImage: "url('/media/common/textures/parchment-bg.webp')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Classical Inset Fillet Border */}
                    <div className="pointer-events-none absolute inset-1.5 border border-[#b88c4b]/40" />

                    {/* Classical Corner Stars */}
                    <div className="pointer-events-none absolute top-2 left-2 text-[8px] text-[#b88c4b]">
                      ✦
                    </div>
                    <div className="pointer-events-none absolute top-2 right-2 text-[8px] text-[#b88c4b]">
                      ✦
                    </div>
                    <div className="pointer-events-none absolute bottom-2 left-2 text-[8px] text-[#b88c4b]">
                      ✦
                    </div>
                    <div className="pointer-events-none absolute bottom-2 right-2 text-[8px] text-[#b88c4b]">
                      ✦
                    </div>

                    <div className="relative z-10 flex items-center justify-between pb-3.5 mb-5 border-b border-[#b88c4b]/40">
                      <h3 className="font-cinzel text-lg sm:text-xl font-black uppercase tracking-[0.12em] text-[#241104]">
                        Coordinators POC
                      </h3>
                      <span className="text-[#b84218] text-xs">
                        ✦
                      </span>
                    </div>

                    <div className="relative z-10 space-y-3.5">
                      {selected.coordinators &&
                      selected.coordinators.length > 0 ? (
                        selected.coordinators.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-4 border border-[#b88c4b]/50 bg-[#fffdfa]/75 backdrop-blur-xs shadow-xs flex flex-col gap-1.5 transition-all hover:border-[#b84218]"
                          >
                            <span className="font-cinzel text-sm sm:text-base font-bold text-[#241104] uppercase tracking-wider">
                              {c.name}
                            </span>
                            {c.contact || c.phone ? (
                              <a
                                href={`tel:${c.contact || c.phone}`}
                                className="font-garamond text-base font-bold text-[#b84218] hover:text-[#7f2608] transition-colors inline-flex items-center gap-2 mt-0.5"
                              >
                                <span className="text-sm">☎</span>
                                <span>{c.contact || c.phone}</span>
                              </a>
                            ) : (
                              <span className="font-garamond text-xs italic text-[#7c4825]">
                                Contact available at arena desk
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="font-garamond italic text-base text-[#6b3c1a]">
                          No coordinators listed.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Register Now Button in royal terracotta & gold (Culrav) or imperial purple & gold (Avishkar) */}
            <EventRegistrationLink
              festival={festival}
              category={catSlug}
              title={selected.title}
            />
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
