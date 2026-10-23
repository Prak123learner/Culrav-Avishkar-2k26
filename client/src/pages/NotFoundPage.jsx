import React from "react";
import { motion } from "framer-motion";
import { Compass, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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

export default function NotFoundPage() {
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
        <div className="pointer-events-none absolute top-3 left-3 text-[9px] text-[#f3cf8a]/50">
          ✦
        </div>
        <div className="pointer-events-none absolute top-3 right-3 text-[9px] text-[#f3cf8a]/50">
          ✦
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 text-[9px] text-[#f3cf8a]/50">
          ✦
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 text-[9px] text-[#f3cf8a]/50">
          ✦
        </div>

        {/* ===================== ROTATING CELESTIAL ASTROLABE ===================== */}
        <div className="relative flex justify-center mb-4 sm:mb-5">
          <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center">
            
            {/* Outer Rotating Astrolabe Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-[#b88c4b]/70"
            />

            {/* Counter-rotating Middle Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute inset-1.5 rounded-full border border-[#f3cf8a]/40"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-[#f3cf8a]">
                ✦
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-[8px] text-[#f3cf8a]">
                ✦
              </div>
            </motion.div>

            {/* Inner Core */}
            <div className="absolute inset-4 rounded-full border border-[#f3cf8a]/40 bg-[#351c0b] shadow-[0_0_20px_rgba(243,207,138,0.3)] flex items-center justify-center">
              <Compass className="h-8 w-8 sm:h-10 sm:w-10 text-[#f3cf8a] drop-shadow-[0_0_10px_rgba(243,207,138,0.6)]" />
            </div>

          </div>
        </div>

        {/* Top Eyebrow Tag */}
        <div className="flex items-center justify-center gap-2 text-xs font-cinzel font-bold uppercase tracking-[0.25em] text-[#d4a259] mb-1">
          <span>✦</span>
          <span>ERROR CDIV · 404</span>
          <span>✦</span>
        </div>

        {/* Main Title */}
        <h1 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-[0.14em] text-[#faeed8] drop-shadow-sm">
          LOST BEYOND THE CITADEL
        </h1>

        {/* Laurel Divider */}
        <div className="my-2.5 flex justify-center">
          <LaurelDivider className="text-[#d4a259]" />
        </div>

        {/* Cormorant Garamond Epigraph */}
        <p className="font-garamond mx-auto max-w-md text-base sm:text-lg italic text-[#d4b48d] leading-relaxed mb-6">
          "Traveler, thy footsteps have wandered past the surveyed bounds of Culrav and Avishkar into uncharted void. Neither ancient papyri nor celestial astrolabes record this route."
        </p>

        {/* Primary CTA: Button to Go to Home */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border-2 border-[#f3cf8a] bg-gradient-to-r from-[#b88c4b] via-[#a07436] to-[#8c6536] px-8 py-3.5 font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#1a0e05] shadow-[0_6px_22px_rgba(243,207,138,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 hover:brightness-110"
          >
            <Home className="w-4 h-4 text-[#1a0e05] transition-transform group-hover:-translate-y-0.5" />
            <span>Return to Home</span>
          </Link>
        </div>

        {/* Coordinate Subtext */}
        <p className="font-cinzel text-[10px] tracking-[0.2em] uppercase text-[#a88a6d] mt-5">
          Unmapped Meridian Coordinate
        </p>
      </motion.div>
    </div>
  );
}
