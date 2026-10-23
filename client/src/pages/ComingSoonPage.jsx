import React from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Clock,
  ArrowLeft,
  Users,
  Home,
  Compass,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Classical Greek Laurel Divider
const LaurelDivider = ({ className = "text-[#8c6536]" }) => (
  <div className={`flex items-center justify-center gap-2 ${className}`}>
    <svg
      viewBox="0 0 80 30"
      className="h-4 sm:h-5 w-12 sm:w-14 rotate-180"
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
      className="h-4 sm:h-5 w-12 sm:w-14"
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

export default function ComingSoonPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve optional event details if redirected from portal
  const eventName = location.state?.eventTitle || location.state?.eventName || "";

  return (
    <div className="relative min-h-screen sm:h-screen w-full bg-[#edd8b1] text-[#2c1d0c] select-none overflow-hidden flex flex-col items-center justify-center pt-24 sm:pt-28 pb-8 px-4 sm:px-6">
      {/* High-Resolution Ancient Parchment Texture Background */}
      <div
        style={{ transform: "translateZ(0)" }}
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      >
        <img
          src="/media/common/textures/parchment-bg.png"
          alt="Ancient Parchment"
          className="w-full h-full object-cover object-center opacity-85"
        />
        {/* Soft warm golden vignette & dual atmospheric lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#edd8b1]/60 via-transparent to-[#e8d2a6]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,215,160,0.45),_transparent_70%)]" />
      </div>

      {/* Main Single-Screen Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl text-center p-5 sm:p-8 md:p-9 rounded-2xl border-2 border-[#b88c4b] bg-gradient-to-b from-[#2a170a] via-[#1a0e05] to-[#120803] text-[#faeed8] shadow-[0_20px_50px_rgba(44,29,12,0.35)] my-auto"
      >
        {/* Classical Double Inset Fillet Border */}
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-[#f3cf8a]/25" />

        {/* Roman Corner Stars */}
        <div className="pointer-events-none absolute top-3 left-3 text-[9px] text-[#f3cf8a]/50">✦</div>
        <div className="pointer-events-none absolute top-3 right-3 text-[9px] text-[#f3cf8a]/50">✦</div>
        <div className="pointer-events-none absolute bottom-3 left-3 text-[9px] text-[#f3cf8a]/50">✦</div>
        <div className="pointer-events-none absolute bottom-3 right-3 text-[9px] text-[#f3cf8a]/50">✦</div>

        {/* Central Lock / Seal Emblem */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-2 border-[#b88c4b]/80 bg-[#351c0b] text-[#f3cf8a] shadow-[0_0_25px_rgba(243,207,138,0.25)]">
            <Lock className="h-8 w-8 sm:h-9 sm:w-9 text-[#f3cf8a] drop-shadow-[0_0_12px_rgba(243,207,138,0.6)]" />
          </div>
        </div>

        {/* Top Eyebrow Tag */}
        <div className="flex items-center justify-center gap-2 text-xs font-cinzel font-bold uppercase tracking-[0.25em] text-[#d4a259] mb-1">
          <span>✦</span>
          <span>INSCRIPTIO PENDENS · MMXXVI</span>
          <span>✦</span>
        </div>

        {/* Main Title */}
        <h1 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-[0.14em] text-[#faeed8] drop-shadow-sm">
          {eventName ? (
            <>
              <span className="text-base sm:text-lg block text-[#d4a259] font-bold mb-0.5">
                {eventName}
              </span>
              REGISTRATION OPENS SOON
            </>
          ) : (
            "FORM UNDER ARCHON SEAL"
          )}
        </h1>

        {/* Laurel Divider */}
        <div className="my-2.5 flex justify-center">
          <LaurelDivider className="text-[#d4a259]" />
        </div>

        {/* Cormorant Garamond Epigraph */}
        <p className="font-garamond mx-auto max-w-md text-base sm:text-lg italic text-[#d4b48d] leading-relaxed mb-4">
          "The event coordinators and module curators are currently finalizing the quest rulebooks, submission parameters, and team rosters. The official registration form for this arena has not yet been unlocked for public submissions."
        </p>

        {/* Status Plinth */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#b88c4b]/40 bg-[#140b04]/80 text-[#d4b48d] font-cinzel text-[11px] tracking-wider uppercase mb-6">
          <Clock className="w-3 h-3 text-[#f3cf8a]" />
          <span>Status: Form Under Formulation & Slot Allotment</span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/portal");
              }
            }}
            className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full border-2 border-[#f3cf8a] bg-gradient-to-r from-[#b88c4b] via-[#a07436] to-[#8c6536] px-6 sm:px-7 py-3 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-[#1a0e05] shadow-[0_6px_20px_rgba(243,207,138,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 hover:brightness-110"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#1a0e05] transition-transform group-hover:-translate-x-1" />
            <span>Return to Previous</span>
          </button>

          <Link
            to="/portal"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f3cf8a]/50 bg-transparent hover:bg-[#f3cf8a]/10 px-5 sm:px-6 py-3 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-[#f3cf8a] transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#8c6536]/40 bg-transparent hover:bg-white/5 px-4 py-3 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-[#d4b48d] hover:text-white transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Citadel</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
