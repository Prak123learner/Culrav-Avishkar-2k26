import React from "react";
import { motion } from "framer-motion";
import {
  Award,
  Download,
  Mail,
  Sparkles,
  ArrowRight,
  Shield,
  Building2,
  Globe,
  Home,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
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

export default function SponsorsPage() {
  const handleBrochureDownload = () => {
    toast.success("Culrav-Avishkar 2026 Sponsorship Brochure", {
      description: "Brochure prospectus link copied & initiating transmission.",
    });
    const link = document.createElement("a");
    link.href = "#brochure";
    link.setAttribute("download", "Culrav_Avishkar_2026_Sponsorship_Brochure.pdf");
    document.body.appendChild(link);
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#edd8b1] text-[#2c1d0c] pt-20 pb-12 select-none overflow-x-hidden flex flex-col justify-between items-center">
      {/* High-Resolution Ancient Parchment Texture Background */}
      <div
        style={{ transform: "translateZ(0)" }}
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      >
        <img
          src="/media/common/textures/parchment-bg-20261026.webp"
          alt="Ancient Parchment"
          className="w-full h-full object-cover object-center opacity-85"
        />
        {/* Soft warm golden vignette & dual atmospheric lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#edd8b1]/60 via-transparent to-[#e8d2a6]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,215,160,0.45),_transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full my-auto text-center">
        
        {/* ===================== TOP FLANKING LINES ===================== */}
        <div className="my-2 sm:my-3 flex select-none flex-col items-center justify-center">
          <div className="flex w-full max-w-xl items-center justify-center gap-3 px-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8c6536] to-[#8c6536]" />
            <div className="font-cinzel flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#7d5628]">
              <span>✦</span>
              <span>SACRAE ALLIANCES · MMXXVI</span>
              <span>✦</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8c6536] to-[#8c6536]" />
          </div>
          <span className="font-cinzel mt-1 text-[11px] uppercase tracking-[0.3em] text-[#876233]">
            Motilal Nehru National Institute of Technology Allahabad
          </span>
        </div>

        {/* Central Card with Fillet Border */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mt-4 sm:mt-6 overflow-hidden rounded-2xl border-2 border-[#b88c4b] bg-gradient-to-b from-[#2a170a] via-[#1a0e05] to-[#120803] p-7 sm:p-12 text-[#faeed8] shadow-[0_20px_50px_rgba(44,29,12,0.35)]"
        >
          {/* Classical Inset Fillet Border */}
          <div className="pointer-events-none absolute inset-2 rounded-xl border border-[#f3cf8a]/20" />

          {/* Corner Filigree Stars */}
          <div className="pointer-events-none absolute top-3 left-3 text-[9px] text-[#f3cf8a]/50">✦</div>
          <div className="pointer-events-none absolute top-3 right-3 text-[9px] text-[#f3cf8a]/50">✦</div>
          <div className="pointer-events-none absolute bottom-3 left-3 text-[9px] text-[#f3cf8a]/50">✦</div>
          <div className="pointer-events-none absolute bottom-3 right-3 text-[9px] text-[#f3cf8a]/50">✦</div>

          {/* Title */}
          <h1 className="font-cinzel text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.11em] text-[#faeed8]">
            SPONSORS WILL BE REVEALED SOON
          </h1>

          {/* Laurel Divider */}
          <div className="my-3 flex justify-center">
            <LaurelDivider className="text-[#d4a259]" />
          </div>

          {/* Poetic Cormorant Garamond Epigraph */}
          <p className="font-garamond mx-auto max-w-2xl text-base sm:text-xl italic text-[#d4b48d] leading-relaxed">
            "The sacred covenants between the dual realms and industry titans are currently being ratified by the Central Council. The official herald of our esteemed patrons shall soon be proclaimed to all fifty thousand attendees."
          </p>

          {/* Status Plinth */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-cinzel">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#b88c4b]/50 bg-[#140b04]/80 text-[#d4b48d]">
              <span className="h-2 w-2 rounded-full bg-[#f3cf8a] animate-pulse" />
              <span>Status: <strong className="text-[#f3cf8a]">Ratifications in Progress</strong></span>
            </span>
            <span className="hidden sm:inline text-[#b88c4b]/60">•</span>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#b88c4b]/50 bg-[#140b04]/80 text-[#d4b48d]">
              <span>ETA: <strong className="text-[#f3cf8a]">Conclave Herald Forthcoming</strong></span>
            </span>
          </div>
        </motion.div>

        {/* Bottom Back Waypoint */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-cinzel text-xs font-bold uppercase tracking-[0.25em] text-[#7d5628] hover:text-[#2c1d0c] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Festival Citadel</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
