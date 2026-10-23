import React, { useState, memo } from "react";
import { Instagram } from "lucide-react";

const CardTeam = memo(({ name, img, role, instagram, eager = false }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      style={{ contentVisibility: "auto", containIntrinsicSize: "220px 293px" }}
      className="group relative flex flex-col overflow-hidden rounded-md border-2 border-[#b88c4b]/50 bg-gradient-to-b from-[#2a170a] via-[#1a0e05] to-[#120803] shadow-[0_8px_20px_rgba(44,29,12,0.16)] transition-all duration-400 ease-out hover:z-20 hover:-translate-y-1.5 hover:border-[#f3cf8a] hover:shadow-[0_16px_32px_rgba(184,140,75,0.32)] cursor-default select-none"
    >
      {/* Classical Double Inset Fillet Border */}
      <div className="pointer-events-none absolute inset-1.5 z-20 rounded-xs border border-[#f3cf8a]/25 transition-colors duration-300 group-hover:border-[#f3cf8a]/60" />

      {/* Top Roman Corner Ornaments */}
      <div className="pointer-events-none absolute top-2 left-2 z-20 text-[8px] text-[#f3cf8a]/60 transition-colors group-hover:text-[#f3cf8a]">
        ✦
      </div>
      <div className="pointer-events-none absolute top-2 right-2 z-20 text-[8px] text-[#f3cf8a]/60 transition-colors group-hover:text-[#f3cf8a]">
        ✦
      </div>

      {/* Member Portrait Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {!hasError && img ? (
          <img
            src={img}
            alt={name}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover object-top transition-all duration-500 ease-out group-hover:scale-108 group-hover:brightness-105"
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
          />
        ) : (
          /* Classical Marble Olympian Silhouette Fallback */
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#251509] p-4 text-[#b88c4b]/50">
            <svg viewBox="0 0 100 100" className="h-16 w-16 fill-current opacity-70">
              <circle cx="50" cy="35" r="20" />
              <path d="M15 90 C15 65 30 55 50 55 C70 55 85 65 85 90 Z" />
            </svg>
            <span className="font-cinzel text-[10px] tracking-widest uppercase mt-2 text-[#d4b48d]/60">
              Archon
            </span>
          </div>
        )}

        {/* Top Soft Vignette */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#140b04]/70 via-transparent to-transparent z-10" />

        {/* Bottom Cartouche Gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#140b04] via-[#140b04]/85 to-transparent z-10" />
      </div>

      {/* Bottom Inscription Plinth */}
      <div className="absolute inset-x-0 bottom-0 p-3 z-20 flex flex-col items-center text-center">
        <h3 className="font-cinzel text-xs sm:text-sm font-bold tracking-wider text-[#f7eedc] transition-colors group-hover:text-[#f3cf8a] drop-shadow-md line-clamp-1">
          {name}
        </h3>
        {instagram && (
          <a
            href={`https://www.instagram.com/${instagram}/`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-general text-[9px] font-bold tracking-wider text-[#f7eedc]/80 transition-colors hover:text-[#f3cf8a]"
            aria-label={`${name} on Instagram`}
          >
            <Instagram size={11} aria-hidden="true" />
            <span>Instagram</span>
          </a>
        )}

        {/* Underline Flourish on Hover */}
        <div className="mt-1 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="h-px w-5 bg-[#b88c4b]/70" />
          <span className="text-[7px] text-[#f3cf8a]">✦</span>
          <div className="h-px w-5 bg-[#b88c4b]/70" />
        </div>
      </div>
    </div>
  );
});

CardTeam.displayName = "CardTeam";

export default CardTeam;
