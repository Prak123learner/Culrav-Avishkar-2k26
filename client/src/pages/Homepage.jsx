import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Menu,
  X,
  Terminal,
  Zap,
  ChevronLeft,
  ChevronRight,
  Aperture,
  ArrowUpRight,
  Disc,
  Radio,
  Play,
  Instagram,
  Mail,
} from "lucide-react";
import { Link } from "react-router";

import TimeStampCard from "../components/TimeStampCard";
import { preloadPublicRoute } from "../components/publicRoutePreload";
// import GallerySection from "./Homepage/GallerySection";

gsap.registerPlugin(ScrollTrigger);

// --- CONFIGURATION: ADD YOUR ASSETS HERE ---
// Leave as "" to use the futuristic placeholders
const LOGO_URLS = {
  main: "/media/common/branding/Culrav-Avishkar-2026logo.png", // e.g., "/logos/combined-logo.png"
  culrav: "/media/common/branding/Culravlogo.png", // e.g., "/logos/culrav-logo.png"
  avishkar: "/media/common/branding/Avishkarlogo.png", // e.g., "/logos/avishkar-logo.png"
};

const VIDEO_URLS = {
  heroBg: "/media/homepage/videos/hero-video-20261026.webm", // e.g., "/videos/cyberpunk-city-loop.mp4"
  teaser: "", // e.g., "/videos/fest-teaser.mp4"
};

// --- SVG PLACEHOLDERS (Fallbacks) ---

const CombinedLogoPlaceholder = ({ className }) => (
  <div
    className={`flex items-center justify-center font-bold tracking-tighter ${className}`}
  >
    <div className="relative group cursor-pointer">
      <div className="absolute -inset-2 bg-cyan-500/20 blur-md rounded-full group-hover:bg-cyan-400/40 transition-all"></div>
      <span className="relative text-white text-xl md:text-2xl font-mono border-2 border-transparent border-b-cyan-500 pb-1">
        <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
          CUL
        </span>
        RAV
        <span className="mx-1 text-gray-500">X</span>
        <span className="text-fuchsia-500 drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]">
          AVI
        </span>
        SHKAR
      </span>
    </div>
  </div>
);

// --- HELPER COMPONENTS ---

const GlitchText = ({
  text,
  className = "",
  color1 = "text-fuchsia-500",
  color2 = "text-cyan-500",
}) => {
  return (
    <div className={`relative inline-block group ${className}`}>
      <span className="relative z-10">{text}</span>
      <span
        className={`absolute top-0 left-0 -z-10 w-full h-full ${color1} opacity-0 group-hover:opacity-70 animate-glitch-1 translate-x-[2px]`}
      >
        {text}
      </span>
      <span
        className={`absolute top-0 left-0 -z-10 w-full h-full ${color2} opacity-0 group-hover:opacity-70 animate-glitch-2 -translate-x-[2px]`}
      >
        {text}
      </span>
    </div>
  );
};

const SectionHeading = ({
  number,
  title,
  numberColor = "text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-fuchsia-500",
  titleColor = "text-white",
  lineClass = "bg-gradient-to-r from-cyan-500 via-white to-fuchsia-500",
  subtitleColor = "text-gray-500",
  subtitle = "SYSTEM_OPTIMIZED",
  // Cinzel / parchment mode — mirrors the Two Realms heading exactly
  cinzel = false,
  cinzelLabel = "",
  cinzelSubtitle = "",
  cinzelLabelColor = "text-[#7d5628]",
}) => (
  <div className="text-center mb-10 md:mb-16 relative z-10 px-4">
    {cinzel ? (
      <>
        {/* ✦ Label with flanking lines — exact Two Realms pattern */}
        <div className="my-4 flex select-none flex-col items-center justify-center">
          <div className="flex w-full max-w-xl items-center justify-center gap-3 px-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8c6536] to-[#8c6536]" />
            <div
              className={`font-cinzel flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${cinzelLabelColor}`}
            >
              <span>✦</span>
              <span>{cinzelLabel || title}</span>
              <span>✦</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8c6536] to-[#8c6536]" />
          </div>
          {cinzelSubtitle && (
            <span
              className={`font-cinzel mt-1 text-[11px] uppercase tracking-[0.24em] ${cinzelLabelColor}`}
            >
              {cinzelSubtitle}
            </span>
          )}
        </div>

        {/* Main h2 — font-cinzel, wide tracking, drop-shadow */}
        <h2
          className={`font-cinzel mt-3 text-3xl font-black uppercase tracking-[0.12em] drop-shadow-sm sm:text-5xl md:text-6xl section-title ${titleColor}`}
        >
          {number && (
            <span
              className={`text-xl sm:text-2xl md:text-4xl mr-2 md:mr-4 ${numberColor}`}
            >
              {number}.
            </span>
          )}
          {title}
        </h2>

        {/* Laurel divider — same as Two Realms */}
        <div className="mt-3 flex justify-center">
          <LaurelDivider />
        </div>
      </>
    ) : (
      <>
        {/* Original tech style */}
        <h2
          className={`text-3xl sm:text-4xl md:text-6xl font-black mb-2 tracking-tighter uppercase section-title break-words ${titleColor}`}
        >
          <span
            className={`text-xl sm:text-2xl md:text-4xl mr-2 md:mr-4 font-mono ${numberColor}`}
          >
            {number}.
          </span>
          {title}
        </h2>
        <div
          className={`h-1 w-16 md:w-24 mx-auto skew-x-12 ${lineClass}`}
        ></div>
        <div
          className={`text-[10px] sm:text-xs font-mono mt-2 tracking-[0.2em] sm:tracking-[0.5em] transition-all duration-300 ${subtitleColor}`}
        >
          {subtitle}
        </div>
      </>
    )}
  </div>
);

// --- SECTIONS ---

const Navbar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Main Logo */}
          <div className="flex-shrink-0 logo-trigger">
            {LOGO_URLS.main ? (
              <img
                src={LOGO_URLS.main}
                alt="Culrav x Avishkar"
                className="h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              />
            ) : (
              <CombinedLogoPlaceholder />
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8 font-mono text-xs md:text-sm tracking-widest">
              {["Home", "About", "Artist", "Gallery", "Events"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="relative text-gray-400 hover:text-white transition-colors group py-2"
                >
                  <span className="absolute -left-2 opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity">
                    &gt;
                  </span>
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
              <button className="relative overflow-hidden bg-cyan-600/10 border border-cyan-500 text-cyan-400 hover:text-black hover:bg-cyan-500 px-6 py-2 font-bold transition-all duration-300 skew-x-[-10deg] group">
                <span className="relative z-10 block skew-x-[10deg]">
                  GET_PASSES
                </span>
                <div className="absolute inset-0 bg-cyan-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-b border-cyan-500/30 backdrop-blur-xl absolute w-full">
          <div className="px-4 pt-4 pb-6 space-y-2 font-mono">
            {["Home", "About", "Artist", "Gallery", "Events"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-4 border-l-2 border-transparent hover:border-cyan-500 hover:bg-white/5 text-gray-300 hover:text-cyan-400 transition-all"
              >
                0
                {["Home", "About", "Artist", "Gallery", "Events"].indexOf(
                  item,
                ) + 1}{" "}
                // {item.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const TeaserModal = ({ onClose, onEnterRealm }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return (
    <div
      id="teaser"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="teaser-title"
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-sm border-2 border-[#b8863b] bg-[#140b05] text-[#faeed7] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_50px_rgba(184,134,59,0.3)] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundImage: "url('/media/common/textures/parchment-bg-20261026.webp')",
          backgroundSize: "cover",
          backgroundBlendMode: "multiply",
        }}
      >
        {/* Inner hairline border */}
        <div
          className="pointer-events-none absolute inset-[4px] border border-[#f3cf8a]/30 z-20"
          aria-hidden="true"
        />

        {/* 4 Classical Filigree Corner Accents */}
        <svg
          className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-[#e5b869] z-20"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path d="M0 14V0H14" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="4" cy="4" r="1.5" fill="currentColor" />
        </svg>
        <svg
          className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-[#e5b869] z-20"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path d="M14 14V0H0" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="10" cy="4" r="1.5" fill="currentColor" />
        </svg>
        <svg
          className="pointer-events-none absolute bottom-2 left-2 h-3.5 w-3.5 text-[#e5b869] z-20"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path d="M0 0V14H14" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="4" cy="10" r="1.5" fill="currentColor" />
        </svg>
        <svg
          className="pointer-events-none absolute bottom-2 right-2 h-3.5 w-3.5 text-[#e5b869] z-20"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path d="M14 0V14H0" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="10" cy="10" r="1.5" fill="currentColor" />
        </svg>

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-[#b8863b]/50 bg-[#1c0f07]/90 px-4 py-3 sm:px-6 sm:py-3.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-cinzel tracking-[0.25em] text-[#e8b663] uppercase">
              <span>✦</span>
              <span>Echoes of Olympus</span>
              <span>✦</span>
            </div>
            <h3
              id="teaser-title"
              className="font-cinzel text-sm sm:text-lg font-bold tracking-widest text-[#ffe1a8] drop-shadow-sm uppercase"
            >
              Witness the Official Teaser
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="group/close flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-[#b8863b] bg-[#2a160c] text-[#f3cf8a] transition-all hover:border-[#ffd47d] hover:bg-[#b8863b] hover:text-[#1a0e06] hover:rotate-90 cursor-pointer"
            aria-label="Close Teaser Modal"
          >
            <X className="h-4 w-4 transition-transform" />
          </button>
        </div>

        {/* Video Player Body */}
        <div className="relative z-10 bg-black/95 p-2 sm:p-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-[#b8863b]/40 bg-black shadow-inner">
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              preload="auto"
              className="h-full w-full object-contain"
            >
              <source
                src={VIDEO_URLS.teaser || VIDEO_URLS.heroBg}
                type="video/webm"
              />
              Your browser does not support video playback.
            </video>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#b8863b]/50 bg-[#1c0f07]/90 px-4 py-3 sm:px-6">
          <p className="font-garamond text-xs sm:text-sm text-[#d4b48d] italic text-center sm:text-left">
            Experience the confluence of Culture & Technology at MNNIT Allahabad.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <a
              href="https://www.instagram.com/reels/DRSakAxkvsq/"
              target="_blank"
              rel="noopener noreferrer"
              className="group/ig inline-flex items-center gap-2 rounded-sm border border-[#b8863b]/70 bg-[#2b160c] px-4 py-2 font-cinzel text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f3cf8a] transition-all hover:border-[#ffd47d] hover:bg-[#3d1d0c] hover:text-[#fff0cc]"
            >
              <Instagram className="h-3.5 w-3.5 text-[#e8b663] transition-transform group-hover/ig:scale-110" />
              <span>Full Reel</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#e8b663] transition-transform group-hover/ig:-translate-y-0.5 group-hover/ig:translate-x-0.5" />
            </a>

            <button
              type="button"
              onClick={onEnterRealm}
              className="inline-flex items-center gap-2 rounded-sm border border-[#b8863b] bg-[#b8863b] px-4 py-2 font-cinzel text-[11px] font-bold uppercase tracking-[0.2em] text-[#1b0f06] shadow-sm transition-all hover:bg-[#d4a55c] hover:border-[#d4a55c] cursor-pointer"
            >
              <span>Enter Realm</span>
              <span>↓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const [isTeaserOpen, setIsTeaserOpen] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#teaser") {
        setIsTeaserOpen(true);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleEnterRealm = (e) => {
    e?.preventDefault();
    const target = document.getElementById("about");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.hash = "about";
    }
  };
  return (
    <section
      id="home"
      className="relative isolate flex h-[100dvh] min-h-[640px] items-center justify-center overflow-hidden bg-[#20130c]"
    >
      <div className="absolute inset-0 -z-20">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          fetchPriority="high"
          className="h-full w-full object-cover object-center"
          aria-hidden="true"
        >
          <source src={VIDEO_URLS.heroBg} type="video/webm" />
        </video>
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center px-4 pb-12 pt-24 text-center sm:px-6 md:pb-16 md:pt-28">
        <div className="hero-title absolute inset-0 flex items-center justify-center px-2 sm:px-6">
          <img
            src={LOGO_URLS.main}
            alt="Culrav and Avishkar"
            className="festival-logo-size hero-logo-glow"
          />
        </div>

        <div className="absolute bottom-10 flex flex-col items-center gap-3 md:bottom-14">
          <div className="hero-sub relative mx-auto flex max-w-3xl items-center justify-center px-2 sm:px-6">
            {/* Left Tabula Ansata Dovetail Wing */}
            <div
              className="pointer-events-none absolute -left-1 top-1/2 hidden -translate-y-1/2 items-center text-[#b8863b] drop-shadow-sm sm:flex"
              aria-hidden="true"
            >
              <svg width="22" height="34" viewBox="0 0 22 34" fill="none">
                <path
                  d="M22 0 L6 8 L6 14 L0 17 L6 20 L6 26 L22 34 Z"
                  fill="#ebd4b0"
                  stroke="#b8863b"
                  strokeWidth="1.2"
                />
                <circle cx="9" cy="17" r="2.2" fill="#8c5824" />
              </svg>
            </div>

            {/* Right Tabula Ansata Dovetail Wing */}
            <div
              className="pointer-events-none absolute -right-1 top-1/2 hidden -translate-y-1/2 items-center text-[#b8863b] drop-shadow-sm sm:flex"
              aria-hidden="true"
            >
              <svg width="22" height="34" viewBox="0 0 22 34" fill="none">
                <path
                  d="M0 0 L16 8 L16 14 L22 17 L16 20 L16 26 L0 34 Z"
                  fill="#ebd4b0"
                  stroke="#b8863b"
                  strokeWidth="1.2"
                />
                <circle cx="13" cy="17" r="2.2" fill="#8c5824" />
              </svg>
            </div>

            {/* Main Inscription Stele Plaque */}
            <div
              className="relative w-full border border-[#b8863b] bg-[#ebd4b0]/95 px-5 py-2.5 text-center shadow-[0_14px_35px_rgba(20,8,2,0.45),inset_0_0_24px_rgba(138,88,32,0.22)] backdrop-blur-md sm:px-8 sm:py-3.5"
              style={{
                backgroundImage: "url('/media/common/textures/parchment-bg-20261026.webp')",
                backgroundSize: "cover",
                backgroundBlendMode: "overlay",
              }}
            >
              {/* Inner Hairline Frame */}
              <div
                className="pointer-events-none absolute inset-[3px] border border-[#c89849]/50"
                aria-hidden="true"
              />

              {/* 4 Corner Classical Filigree Accents */}
              <svg
                className="pointer-events-none absolute left-1.5 top-1.5 h-2.5 w-2.5 text-[#9b6628] sm:h-3 sm:w-3"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path d="M0 14V0H14" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="4" cy="4" r="1.5" fill="currentColor" />
              </svg>
              <svg
                className="pointer-events-none absolute right-1.5 top-1.5 h-2.5 w-2.5 text-[#9b6628] sm:h-3 sm:w-3"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path d="M14 14V0H0" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="10" cy="4" r="1.5" fill="currentColor" />
              </svg>
              <svg
                className="pointer-events-none absolute bottom-1.5 left-1.5 h-2.5 w-2.5 text-[#9b6628] sm:h-3 sm:w-3"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path d="M0 0V14H14" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="4" cy="10" r="1.5" fill="currentColor" />
              </svg>
              <svg
                className="pointer-events-none absolute bottom-1.5 right-1.5 h-2.5 w-2.5 text-[#9b6628] sm:h-3 sm:w-3"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path d="M14 0V14H0" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
              </svg>

              {/* Top Center Stele Crest */}
              <div
                className="pointer-events-none absolute -top-[7px] left-1/2 flex -translate-x-1/2 items-center gap-1.5 border-x border-[#b8863b] bg-[#ebd4b0] px-2.5 text-[#8c5824]"
                aria-hidden="true"
              >
                <span className="text-[8px] leading-none">✦</span>
                <span className="h-1.5 w-1.5 rotate-45 bg-[#8c5824]" />
                <span className="text-[8px] leading-none">✦</span>
              </div>

              {/* Bottom Center Stele Crest */}
              <div
                className="pointer-events-none absolute -bottom-[6px] left-1/2 flex -translate-x-1/2 items-center gap-1.5 border-x border-[#b8863b] bg-[#ebd4b0] px-2 text-[#8c5824]"
                aria-hidden="true"
              >
                <span className="h-1.5 w-1.5 rotate-45 bg-[#8c5824]" />
              </div>

              {/* Inscribed Epigraphic Motto */}
              <p className="relative z-10 m-0 font-trajan text-xs font-bold uppercase tracking-[0.2em] text-[#3d220f] drop-shadow-[0_1px_0_rgba(255,255,255,0.4)] sm:text-sm md:text-base">
                Where Technology meets Culture, and Legends come alive. Enter the Mythos.
              </p>
            </div>
          </div>

          <div className="hero-btns flex flex-wrap items-center justify-center gap-3.5 sm:gap-5">
            {/* Enter the Realm — Primary Imperial Action */}
            <a
              href="#about"
              onClick={handleEnterRealm}
              className="group relative inline-flex h-11 sm:h-12 items-center justify-center gap-3 overflow-hidden rounded-sm border-2 border-[#d4a55c] bg-gradient-to-b from-[#3a1d0d] via-[#241208] to-[#150903] px-6 sm:px-8 py-0 font-cinzel text-[11px] sm:text-xs font-bold uppercase tracking-[0.24em] sm:tracking-[0.28em] text-[#ffe2a8] shadow-[0_12px_32px_rgba(15,6,2,0.65),inset_0_1px_1px_rgba(255,225,160,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ffd47d] hover:shadow-[0_0_30px_rgba(235,180,80,0.45),0_16px_36px_rgba(20,8,2,0.8)] active:translate-y-0 active:scale-[0.98] focus:outline-none cursor-pointer box-border"
            >
              {/* Inner Hairline Frame */}
              <span
                className="pointer-events-none absolute inset-[3px] border border-[#f3cf8a]/35 transition-colors duration-300 group-hover:border-[#f3cf8a]/65"
                aria-hidden="true"
              />

              {/* 4 Corner Diamond Rivets */}
              <span
                className="pointer-events-none absolute left-1 top-1 text-[7px] sm:text-[8px] leading-none text-[#d4a55c] transition-colors group-hover:text-[#ffe4a0]"
                aria-hidden="true"
              >
                ◆
              </span>
              <span
                className="pointer-events-none absolute right-1 top-1 text-[7px] sm:text-[8px] leading-none text-[#d4a55c] transition-colors group-hover:text-[#ffe4a0]"
                aria-hidden="true"
              >
                ◆
              </span>
              <span
                className="pointer-events-none absolute bottom-1 left-1 text-[7px] sm:text-[8px] leading-none text-[#d4a55c] transition-colors group-hover:text-[#ffe4a0]"
                aria-hidden="true"
              >
                ◆
              </span>
              <span
                className="pointer-events-none absolute bottom-1 right-1 text-[7px] sm:text-[8px] leading-none text-[#d4a55c] transition-colors group-hover:text-[#ffe4a0]"
                aria-hidden="true"
              >
                ◆
              </span>

              {/* Radial Center Warm Glow */}
              <span
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(235,175,70,0.22)_0%,transparent_75%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />

              {/* Shimmer Light Sweep */}
              <span
                className="pointer-events-none absolute -inset-full h-auto w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-1000 ease-out group-hover:left-full"
                aria-hidden="true"
              />

              {/* Content */}
              <span className="relative z-10 flex items-center justify-center gap-2.5 leading-none">
                <span
                  className="text-[10px] sm:text-xs text-[#e8b663] transition-transform duration-500 group-hover:rotate-90 group-hover:scale-125 group-hover:text-[#fff0cc] leading-none"
                  aria-hidden="true"
                >
                  ✦
                </span>
                <span className="leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  Enter the Realm
                </span>
                <span
                  className="text-[10px] sm:text-xs text-[#e8b663] transition-transform duration-500 group-hover:-rotate-90 group-hover:scale-125 group-hover:text-[#fff0cc] leading-none"
                  aria-hidden="true"
                >
                  ✦
                </span>
              </span>
            </a>

            {/* Witness the Teaser — Secondary Parchment Stele Action */}
            <a
              href="https://www.instagram.com/reels/DRSakAxkvsq/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Witness the Teaser on Instagram Reels"
              className="group relative inline-flex h-11 sm:h-12 items-center justify-center gap-3 overflow-hidden rounded-sm border-2 border-[#b8863b] bg-gradient-to-b from-[#fbf2e0]/95 via-[#faeed7]/90 to-[#f3dfbc]/95 px-6 sm:px-8 py-0 font-cinzel text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] sm:tracking-[0.26em] text-[#422209] shadow-[0_12px_28px_rgba(35,15,5,0.3),inset_0_1px_1px_rgba(255,255,255,0.7)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8c5824] hover:bg-[#f5dfb8] hover:shadow-[0_0_22px_rgba(200,140,50,0.35),0_14px_32px_rgba(40,15,5,0.3)] active:translate-y-0 active:scale-[0.98] focus:outline-none cursor-pointer box-border"
              style={{
                backgroundImage: "url('/media/common/textures/parchment-bg-20261026.webp')",
                backgroundSize: "cover",
                backgroundBlendMode: "overlay",
              }}
            >
              {/* Inner Hairline Frame */}
              <span
                className="pointer-events-none absolute inset-[3px] border border-[#a87430]/35 transition-colors duration-300 group-hover:border-[#a87430]/65"
                aria-hidden="true"
              />

              {/* 4 Corner Diamond Rivets */}
              <span
                className="pointer-events-none absolute left-1 top-1 text-[7px] sm:text-[8px] leading-none text-[#9b6628] transition-colors group-hover:text-[#5a2e0a]"
                aria-hidden="true"
              >
                ◆
              </span>
              <span
                className="pointer-events-none absolute right-1 top-1 text-[7px] sm:text-[8px] leading-none text-[#9b6628] transition-colors group-hover:text-[#5a2e0a]"
                aria-hidden="true"
              >
                ◆
              </span>
              <span
                className="pointer-events-none absolute bottom-1 left-1 text-[7px] sm:text-[8px] leading-none text-[#9b6628] transition-colors group-hover:text-[#5a2e0a]"
                aria-hidden="true"
              >
                ◆
              </span>
              <span
                className="pointer-events-none absolute bottom-1 right-1 text-[7px] sm:text-[8px] leading-none text-[#9b6628] transition-colors group-hover:text-[#5a2e0a]"
                aria-hidden="true"
              >
                ◆
              </span>

              {/* Shimmer Light Sweep */}
              <span
                className="pointer-events-none absolute -inset-full h-auto w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[#ffe7b8]/25 to-transparent transition-all duration-1000 ease-out group-hover:left-full"
                aria-hidden="true"
              />

              {/* Content */}
              <span className="relative z-10 flex items-center justify-center gap-2.5 leading-none">
                {/* Golden Play Badge */}
                <span
                  className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 shrink-0 items-center justify-center rounded-full border border-[#8c5824] bg-gradient-to-b from-[#b8863b] to-[#7a4816] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-[#5a2e0a] group-hover:shadow-[0_0_8px_rgba(184,134,59,0.7)]"
                  aria-hidden="true"
                >
                  <Play className="h-2 w-2 sm:h-2.5 sm:w-2.5 fill-current text-[#faeed7] ml-0.5" />
                </span>
                <span className="leading-none drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                  Witness the Teaser
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {isTeaserOpen && (
        <TeaserModal
          onClose={() => {
            setIsTeaserOpen(false);
            if (window.location.hash === "#teaser") {
              history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search,
              );
            }
          }}
          onEnterRealm={(e) => {
            setIsTeaserOpen(false);
            handleEnterRealm(e);
          }}
        />
      )}
    </section>
  );
};

const RealmSeparator = () => (
  <div className="relative z-30 flex w-full select-none items-center justify-center border-y-2 border-[#b88c4b] bg-[#1b0f05] py-2 shadow-[0_6px_20px_rgba(0,0,0,0.5)]">
    <div className="flex w-full max-w-6xl items-center justify-center gap-3 px-4 sm:gap-4">
      <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#b88c4b] to-[#f3cf8a]" />
      <div className="flex shrink-0 items-center gap-2 text-[#f3cf8a]">
        <span className="text-xs text-[#e8b663]">✦</span>
        <span className="h-2.5 w-2.5 rotate-45 border border-[#f3cf8a] bg-[#b88c4b]" />
        <span className="text-xs text-[#e8b663]">✦</span>
      </div>
      <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-[#b88c4b] to-[#f3cf8a]" />
    </div>
  </div>
);

const LaurelDivider = () => (
  <div className="flex h-6 w-32 select-none items-center justify-center gap-1 text-[#8c6536]">
    <svg
      viewBox="0 0 80 30"
      className="h-6 w-16 rotate-180"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M5,15 Q40,5 75,15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M60,13 Q68,6 74,12 Q66,16 60,13 Z" />
      <path d="M48,11 Q56,4 62,10 Q54,14 48,11 Z" />
      <path d="M36,9 Q44,2 50,8 Q42,12 36,9 Z" />
      <path d="M24,7 Q32,0 38,6 Q30,10 24,7 Z" />
      <path d="M52,19 Q58,26 64,20 Q58,16 52,19 Z" />
      <path d="M40,17 Q46,24 52,18 Q46,14 40,17 Z" />
      <path d="M28,15 Q34,22 40,16 Q34,12 28,15 Z" />
    </svg>
    <span className="h-2 w-2 shrink-0 rotate-45 bg-current" />
    <svg
      viewBox="0 0 80 30"
      className="h-6 w-16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M5,15 Q40,5 75,15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
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

const CulravRealmIcon = () => (
  <svg
    viewBox="0 0 100 100"
    className="h-14 w-14 text-[#c4681f] sm:h-16 sm:w-16"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle
      cx="50"
      cy="50"
      r="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    />
    <circle cx="50" cy="50" r="12" opacity="0.3" />
    <circle cx="50" cy="50" r="6" />
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="50,5 53,24 47,24" />
      <polygon points="95,50 76,53 76,47" />
      <polygon points="50,95 47,76 53,76" />
      <polygon points="5,50 24,47 24,53" />
      <polygon points="82,18 70,33 65,28" />
      <polygon points="82,82 67,70 72,65" />
      <polygon points="18,82 33,70 28,65" />
      <polygon points="18,18 30,33 35,28" />
    </g>
  </svg>
);

const AvishkarRealmIcon = () => (
  <svg
    viewBox="0 0 100 100"
    className="h-14 w-14 text-[#463270] sm:h-16 sm:w-16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      d="M50 88C30 80 18 60 22 34c2-10 8-18 16-24M50 88c20-8 32-28 28-54-2-10-8-18-16-24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M24 76c-6-2-10-8-6-12 4 0 7 6 6 12Zm4 2c4-4 5-11 0-14-3 4-3 10 0 14ZM18 60c-6-2-9-9-4-13 5 1 7 7 4 13Zm5 2c5-5 5-12 0-15-3 4-2 11 0 15ZM17 44c-6-3-8-11-2-14 5 2 6 9 2 14Zm6 2c4-6 5-13-1-16-3 4-2 11 1 16ZM22 28c-5-5-4-12 2-14 4 4 3 10-2 14Zm7 2c4-7 6-14 0-16-3 4-3 12 0 16Zm4-14c-3-6 0-11 6-10 2 4-1 10-6 10ZM76 76c6-2 10-8 6-12-4 0-7 6-6 12Zm-4 2c-4-4-5-11 0-14 3 4 3 10 0 14Zm10-18c6-2 9-9 4-13-5 1-7 7-4 13Zm-5 2c-5-5-5-12 0-15 3 4 2 11 0 15Zm6-18c6-3 8-11 2-14-5 2-6 9-2 14Zm-6 2c-4-6-5-13 1-16 3 4 2 11-1 16Zm1-18c5-5 4-12-2-14-4 4-3 10 2 14Zm-7 2c-4-7-6-14 0-16 3 4 3 12 0 16Zm-4-14c3-6 0-11-6-10-2 4 1 10 6 10Z" />
    <circle cx="50" cy="88" r="3.5" />
  </svg>
);

const AboutSection = () => {
  return (
    <section
      id="about"
      className="parchment-bg relative flex min-h-[90vh] flex-col justify-center overflow-hidden px-4 pt-20 pb-16 sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="/media/homepage/images/the-duality-20261026.webp"
          alt=""
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#f5e7c8]/10" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mb-10 text-center sm:mb-12">
          <div className="my-4 flex select-none items-center justify-center">
            <div className="flex w-full max-w-xl items-center justify-center gap-3 px-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8c6536] to-[#8c6536]" />
              <div className="font-cinzel flex shrink-0 items-center gap-2 text-xs font-semibold uppercase leading-none tracking-[0.2em] text-[#7d5628]">
                <span className="inline-flex items-center leading-none">✦</span>
                <span>The Duality</span>
                <span className="inline-flex items-center leading-none">✦</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8c6536] to-[#8c6536]" />
            </div>
          </div>

          <h2 className="font-cinzel mt-3 text-3xl font-black uppercase tracking-[0.12em] text-[#2c1d0c] drop-shadow-sm sm:text-5xl md:text-6xl">
            The Two Realms
          </h2>
          <div className="mt-3 flex justify-center">
            <LaurelDivider />
          </div>
        </div>

        <div className="about-cards-container relative grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:gap-16">
          {/* Culrav Realm Card */}
          <div className="about-card-left h-full flex flex-col">
            <div className="group relative flex flex-1 flex-col items-center p-7 text-center drop-shadow-[0_14px_30px_rgba(120,50,10,0.32)] transform-gpu transition-all duration-500 ease-out hover:scale-[1.03] hover:-translate-y-1.5 hover:drop-shadow-[0_24px_48px_rgba(215,95,15,0.48)] sm:p-10">
              <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
                <img
                  src="/media/homepage/images/realm-card-20261026.webp"
                  alt="Culrav realm card"
                  className="h-full w-full select-none object-fill"
                />
              </div>

              <div className="relative z-10 flex h-full w-full flex-col items-center text-center">
                <div className="mb-3 flex h-28 sm:h-32 w-full items-center justify-center">
                  <img
                    src={LOGO_URLS.culrav}
                    alt="Culrav"
                    className="w-full max-h-full max-w-[250px] sm:max-w-[300px] object-contain drop-shadow-[0_8px_16px_rgba(130,59,10,0.28)]"
                  />
                </div>
                <div className="my-2 flex w-32 items-center justify-center gap-2 text-[#b86d2a]">
                  <div className="h-px flex-1 bg-current opacity-60" />
                  <span className="text-[10px]">✦</span>
                  <div className="h-px flex-1 bg-current opacity-60" />
                </div>

                <p className="font-garamond my-4 max-w-sm text-lg font-semibold leading-relaxed text-[#533920] sm:text-xl">
                  The realm of art, expression and celebration.
                </p>
                {/* Festival Dates */}
                <div className="my-2.5 flex items-center justify-center gap-2.5 font-cinzel text-sm sm:text-base font-black uppercase tracking-[0.22em] text-[#873e10]">
                  <span className="text-xs text-[#b86d2a] select-none" aria-hidden="true">✦</span>
                  <span
                    className="font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
                    style={{ WebkitTextStroke: "0.35px currentColor" }}
                  >
                    5-7th December 2026
                  </span>
                  <span className="text-xs text-[#b86d2a] select-none" aria-hidden="true">✦</span>
                </div>
                <div className="mt-auto w-full max-w-xs pt-6">
                  <Link
                    to="/culrav"
                    onPointerEnter={() => preloadPublicRoute("/culrav")}
                    onFocus={() => preloadPublicRoute("/culrav")}
                    className="group/btn relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-sm border-2 border-[#d48938] bg-gradient-to-b from-[#8c380b] via-[#5c2105] to-[#3a1302] px-6 py-3 sm:py-3.5 font-cinzel text-xs font-bold uppercase tracking-[0.25em] text-[#fff0d6] shadow-[0_8px_20px_rgba(110,40,5,0.45),inset_0_1px_1px_rgba(255,190,110,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f5af5a] hover:from-[#a6430d] hover:via-[#6e2706] hover:to-[#471803] hover:text-white hover:shadow-[0_12px_28px_rgba(220,90,15,0.55),0_0_24px_rgba(235,140,50,0.4),inset_0_1px_2px_rgba(255,220,150,0.6)] active:translate-y-0 active:scale-[0.98] cursor-pointer"
                  >
                    {/* Inner Hairline Frame */}
                    <span
                      className="pointer-events-none absolute inset-[3px] border border-[#f5b869]/35 transition-colors duration-300 group-hover/btn:border-[#ffd98a]/70"
                      aria-hidden="true"
                    />

                    {/* 4 Corner Diamond Rivets */}
                    <span
                      className="pointer-events-none absolute left-1 top-1 text-[7px] leading-none text-[#e8a252] transition-colors group-hover/btn:text-[#ffe4a0]"
                      aria-hidden="true"
                    >
                      ◆
                    </span>
                    <span
                      className="pointer-events-none absolute right-1 top-1 text-[7px] leading-none text-[#e8a252] transition-colors group-hover/btn:text-[#ffe4a0]"
                      aria-hidden="true"
                    >
                      ◆
                    </span>
                    <span
                      className="pointer-events-none absolute bottom-1 left-1 text-[7px] leading-none text-[#e8a252] transition-colors group-hover/btn:text-[#ffe4a0]"
                      aria-hidden="true"
                    >
                      ◆
                    </span>
                    <span
                      className="pointer-events-none absolute bottom-1 right-1 text-[7px] leading-none text-[#e8a252] transition-colors group-hover/btn:text-[#ffe4a0]"
                      aria-hidden="true"
                    >
                      ◆
                    </span>

                    {/* Radial Center Warm Glow */}
                    <span
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,145,50,0.35)_0%,transparent_75%)] opacity-70 transition-opacity duration-300 group-hover/btn:opacity-100"
                      aria-hidden="true"
                    />

                    {/* Shimmer Light Sweep */}
                    <span
                      className="pointer-events-none absolute -inset-full h-auto w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 ease-out group-hover/btn:left-full"
                      aria-hidden="true"
                    />

                    {/* Content */}
                    <span className="relative z-10 flex items-center justify-center gap-2 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                      <span>Explore Culrav</span>
                      <ArrowUpRight className="h-4 w-4 text-[#ffd48a] transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 group-hover/btn:text-white" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Avishkar Realm Card */}
          <div className="about-card-right h-full flex flex-col">
            <div className="group relative flex flex-1 flex-col items-center p-7 text-center drop-shadow-[0_14px_30px_rgba(120,50,10,0.32)] transform-gpu transition-all duration-500 ease-out hover:scale-[1.03] hover:-translate-y-1.5 hover:drop-shadow-[0_24px_48px_rgba(110,45,170,0.46)] sm:p-10">
              <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
                <img
                  src="/media/homepage/images/realm-card-20261026.webp"
                  alt="Avishkar realm card"
                  className="h-full w-full select-none object-fill"
                />
              </div>

              <div className="relative z-10 flex h-full w-full flex-col items-center text-center">
                <div className="mb-3 flex h-28 sm:h-32 w-full items-center justify-center">
                  <img
                    src={LOGO_URLS.avishkar}
                    alt="Avishkar"
                    className="w-full max-h-full max-w-[250px] sm:max-w-[300px] object-contain drop-shadow-[0_8px_16px_rgba(130,59,10,0.28)] transition-all duration-300 group-hover:drop-shadow-[0_8px_18px_rgba(110,45,170,0.45)]"
                  />
                </div>
                <div className="my-2 flex w-32 items-center justify-center gap-2 text-[#64498e]">
                  <div className="h-px flex-1 bg-current opacity-60" />
                  <span className="text-[10px]">✦</span>
                  <div className="h-px flex-1 bg-current opacity-60" />
                </div>
                <p className="font-garamond my-4 max-w-sm text-lg font-semibold leading-relaxed text-[#44305e] sm:text-xl">
                  The realm of ideas, invention and innovation.
                </p>
                {/* Festival Dates */}
                <div className="my-2.5 flex items-center justify-center gap-2.5 font-cinzel text-sm sm:text-base font-black uppercase tracking-[0.22em] text-[#54307a]">
                  <span className="text-xs text-[#765d9e] select-none" aria-hidden="true">✦</span>
                  <span
                    className="font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
                    style={{ WebkitTextStroke: "0.35px currentColor" }}
                  >
                    2-4th December 2026
                  </span>
                  <span className="text-xs text-[#765d9e] select-none" aria-hidden="true">✦</span>
                </div>
                <div className="mt-auto w-full max-w-xs pt-6">
                  <Link
                    to="/avishkar"
                    onPointerEnter={() => preloadPublicRoute("/avishkar")}
                    onFocus={() => preloadPublicRoute("/avishkar")}
                    className="group/btn relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-sm border-2 border-[#9364b8] bg-gradient-to-b from-[#4a1e75] via-[#2f104e] to-[#1c0830] px-6 py-3 sm:py-3.5 font-cinzel text-xs font-bold uppercase tracking-[0.25em] text-[#f7eeff] shadow-[0_8px_20px_rgba(40,12,65,0.45),inset_0_1px_1px_rgba(215,160,255,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b88ee0] hover:from-[#5d2694] hover:via-[#3d1566] hover:to-[#240a3d] hover:text-white hover:shadow-[0_12px_28px_rgba(130,50,195,0.55),0_0_24px_rgba(165,90,240,0.4),inset_0_1px_2px_rgba(235,190,255,0.6)] active:translate-y-0 active:scale-[0.98] cursor-pointer"
                  >
                    {/* Inner Hairline Frame */}
                    <span
                      className="pointer-events-none absolute inset-[3px] border border-[#c59eeb]/35 transition-colors duration-300 group-hover/btn:border-[#dfc3fa]/70"
                      aria-hidden="true"
                    />

                    {/* 4 Corner Diamond Rivets */}
                    <span
                      className="pointer-events-none absolute left-1 top-1 text-[7px] leading-none text-[#b88ee0] transition-colors group-hover/btn:text-[#f0d9ff]"
                      aria-hidden="true"
                    >
                      ◆
                    </span>
                    <span
                      className="pointer-events-none absolute right-1 top-1 text-[7px] leading-none text-[#b88ee0] transition-colors group-hover/btn:text-[#f0d9ff]"
                      aria-hidden="true"
                    >
                      ◆
                    </span>
                    <span
                      className="pointer-events-none absolute bottom-1 left-1 text-[7px] leading-none text-[#b88ee0] transition-colors group-hover/btn:text-[#f0d9ff]"
                      aria-hidden="true"
                    >
                      ◆
                    </span>
                    <span
                      className="pointer-events-none absolute bottom-1 right-1 text-[7px] leading-none text-[#b88ee0] transition-colors group-hover/btn:text-[#f0d9ff]"
                      aria-hidden="true"
                    >
                      ◆
                    </span>

                    {/* Radial Center Warm Glow */}
                    <span
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(165,85,245,0.35)_0%,transparent_75%)] opacity-70 transition-opacity duration-300 group-hover/btn:opacity-100"
                      aria-hidden="true"
                    />

                    {/* Shimmer Light Sweep */}
                    <span
                      className="pointer-events-none absolute -inset-full h-auto w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 ease-out group-hover/btn:left-full"
                      aria-hidden="true"
                    />

                    {/* Content */}
                    <span className="relative z-10 flex items-center justify-center gap-2 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                      <span>Explore Avishkar</span>
                      <ArrowUpRight className="h-4 w-4 text-[#d8b8ff] transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 group-hover/btn:text-white" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function ArchiveVideo({ src }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !window.IntersectionObserver) {
      setNearViewport(true);
      setHasLoaded(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setNearViewport(entry.isIntersecting);
        if (entry.isIntersecting) setHasLoaded(true);
      },
      { rootMargin: "500px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (nearViewport) {
      videoRef.current?.play().catch(() => { });
    } else {
      videoRef.current?.pause();
    }
  }, [nearViewport]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {hasLoaded && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="archive-video h-full w-full object-cover transition-all duration-700 ease-out grayscale sepia-[90%] hue-rotate-[-15deg] saturate-[220%] brightness-90 contrast-[105%] group-hover:grayscale-0 group-hover:sepia-0 group-hover:hue-rotate-0 group-hover:saturate-100 group-hover:brightness-105 group-hover:contrast-100 group-hover:scale-105"
        >
          <source src={src} type="video/webm" />
        </video>
      )}
    </div>
  );
}

const GallerySection = () => {
  const [touchActiveArchive, setTouchActiveArchive] = useState(null);
  const touchReleaseTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (touchReleaseTimerRef.current) {
        window.clearTimeout(touchReleaseTimerRef.current);
      }
    },
    [],
  );

  const revealArchiveOnTouch = (event, itemId) => {
    if (event.pointerType !== "touch") return;
    if (touchReleaseTimerRef.current) {
      window.clearTimeout(touchReleaseTimerRef.current);
    }
    setTouchActiveArchive(itemId);
  };

  const keepArchiveRevealed = (event, itemId) => {
    if (event.pointerType !== "touch") return;
    if (touchReleaseTimerRef.current) {
      window.clearTimeout(touchReleaseTimerRef.current);
    }
    touchReleaseTimerRef.current = window.setTimeout(() => {
      setTouchActiveArchive((activeId) =>
        activeId === itemId ? null : activeId,
      );
    }, 1100);
  };

  const galleryItems = [
    {
      id: 1,
      act: "ACT",
      numeral: "I",
      title: "JAVED ALI",
      subtitle: "Live Stage Revel",
      src: "/media/homepage/videos/javed-ali.webm",
      gridClass: "md:col-span-2 lg:col-span-3 md:row-span-2",
    },
    {
      id: 2,
      act: "ACT",
      numeral: "II",
      title: "DJ MONIKA",
      subtitle: "The Celestial Pro-Nite",
      src: "/media/homepage/videos/dj-monika.webm",
      gridClass: "md:col-span-1 lg:col-span-3 md:row-span-2",
    },
    {
      id: 3,
      act: "ACT",
      numeral: "III",
      title: "PRAGATI NAGPAL",
      subtitle: "The Electronic Odyssey",
      src: "/media/homepage/videos/pragati-nagpal.webm",
      gridClass: "md:col-span-1 lg:col-span-2 md:row-span-1",
    },
    {
      id: 4,
      act: "ACT",
      numeral: "IV",
      title: "LASHCURRY",
      subtitle: "Arena of Legends",
      src: "/media/homepage/videos/lashcurry.webm",
      gridClass: "md:col-span-1 lg:col-span-2 md:row-span-1",
    },
  ];

  return (
    <section
      id="gallery"
      className="relative bg-cover bg-center pt-10 pb-8 sm:pt-14 sm:pb-12 overflow-hidden select-none"
      style={{ backgroundImage: "url('/media/common/textures/parchment-bg-20261026.webp')" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading matching Two Realms */}
        <div className="mb-10 text-center sm:mb-14">
          <div className="my-4 flex select-none items-center justify-center">
            <div className="flex w-full max-w-xl items-center justify-center gap-3 px-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8c6536] to-[#8c6536]" />
              <div className="font-cinzel flex shrink-0 items-center gap-2 text-xs font-semibold uppercase leading-none tracking-[0.2em] text-[#7d5628]">
                <span className="inline-flex items-center leading-none">✦</span>
                <span>The Colosseum Chronicles</span>
                <span className="inline-flex items-center leading-none">✦</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8c6536] to-[#8c6536]" />
            </div>
          </div>

          <h2 className="font-cinzel mt-3 text-3xl font-black uppercase tracking-[0.12em] text-[#2c1d0c] drop-shadow-sm sm:text-5xl md:text-6xl section-title">
            Visual Archives
          </h2>
          <div className="mt-3 flex justify-center">
            <LaurelDivider />
          </div>
        </div>

        {/* The Mythological Bento Wall (Asymmetric Classical Mosaic) */}
        <div className="archive-grid grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 auto-rows-[240px] sm:auto-rows-[270px] lg:auto-rows-[280px] gap-6 sm:gap-5">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className={`archive-card group relative overflow-hidden rounded-md border-2 border-[#b88c4b]/50 bg-[#140b04] cursor-pointer shadow-[0_10px_25px_rgba(44,29,12,0.18)] transition-all duration-500 ease-out hover:z-30 hover:scale-[1.015] hover:border-[#f3cf8a] hover:shadow-[0_18px_40px_rgba(184,140,75,0.4)] ${item.gridClass} min-h-[260px] md:min-h-0 ${touchActiveArchive === item.id ? "archive-card--touch-active" : ""}`}
              onPointerDown={(event) => revealArchiveOnTouch(event, item.id)}
              onPointerUp={(event) => keepArchiveRevealed(event, item.id)}
              onPointerCancel={(event) => keepArchiveRevealed(event, item.id)}
            >
              {/* Double Inset Arch/Fillet border */}
              <div className="pointer-events-none absolute inset-2 z-20 rounded-sm border border-[#f3cf8a]/20 transition-colors duration-300 group-hover:border-[#f3cf8a]/60" />

              {/* Top-Left Roman Keystone Badge */}
              <div className="absolute top-3.5 left-3.5 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-[#f3cf8a]/40 bg-[#2c1d0c]/85 backdrop-blur-sm shadow-sm transition-transform duration-300 group-hover:scale-105">
                <span className="text-[9px] text-[#f3cf8a]">✦</span>
                <span className="font-cinzel text-[10px] font-bold tracking-widest text-[#f7eedc]">
                  {item.act} · {item.numeral}
                </span>
              </div>

              {/* Video Element with Orangish Monochromatic Filter (blooms to full color on hover) */}
              <ArchiveVideo key={item.src} src={item.src} />

              {/* Orangish Monochrome Duotone Tint (fades out on hover) */}
              <div className="archive-color-tint pointer-events-none absolute inset-0 z-10 bg-[#d4621a]/30 mix-blend-color opacity-80 group-hover:opacity-0 transition-opacity duration-700" />

              {/* Classic Vintage Film Scratches & Grain Texture Overlay */}
              <div
                className="archive-scratches pointer-events-none absolute inset-0 z-10 bg-cover bg-center opacity-55 mix-blend-screen transition-opacity duration-500 group-hover:opacity-40"
                style={{
                  backgroundImage: "url('/media/common/textures/vintage-scratches.webp?v=2')",
                }}
              />

              {/* Antique Parchment & Obsidian Vignette Overlay */}
              <div className="archive-vignette pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#160b04] via-[#160b04]/30 to-transparent transition-opacity duration-500 opacity-65 md:opacity-80 md:group-hover:opacity-30" />

              {/* Idle State Label (Bottom-Left) */}
              <div className="absolute bottom-3.5 left-3.5 z-20 group-hover:opacity-0 transition-opacity duration-300">
                <span className="font-cinzel text-xs font-bold tracking-wider text-[#f7eedc] bg-[#2c1d0c]/85 border border-[#b88c4b]/50 px-3 py-1 rounded-sm backdrop-blur-sm shadow-sm">
                  ✦ {item.title}
                </span>
              </div>

              {/* Hover Revealed Pedestal / Inscription */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-20 flex flex-col justify-end translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] text-[#f3cf8a]">✦</span>
                  <span className="font-cinzel text-[10px] uppercase tracking-[0.25em] text-[#d4a259]">
                    {item.act}
                  </span>
                </div>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-black uppercase tracking-wider text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                  {item.title}
                </h3>
                <div className="my-1.5 flex items-center gap-1.5 text-[#f3cf8a]">
                  <div className="h-px w-8 bg-current opacity-70" />
                  <span className="text-[8px]">✦</span>
                  <div className="h-px w-8 bg-current opacity-70" />
                </div>
                <p className="font-garamond text-xs sm:text-sm italic text-[#ebdcc0]">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}

          {/* Fifth Tile: The Imperial Codex / View All Tile */}
          <Link
            to="/gallery"
            className="group relative flex flex-col items-center justify-center p-6 text-center border-2 border-[#b88c4b]/50 bg-gradient-to-b from-[#2a170a]/90 via-[#1c0e05]/95 to-[#120803] rounded-md shadow-[0_10px_25px_rgba(44,29,12,0.22)] transition-all duration-500 hover:z-30 hover:scale-[1.015] hover:border-[#f3cf8a] hover:shadow-[0_18px_40px_rgba(184,140,75,0.4)] min-h-[260px] md:min-h-0 md:col-span-1 lg:col-span-2 md:row-span-1"
          >
            {/* Inset Fillet border */}
            <div className="pointer-events-none absolute inset-2 rounded-sm border border-[#f3cf8a]/20 transition-colors duration-300 group-hover:border-[#f3cf8a]/50" />

            {/* Laurel Medallion Icon */}
            <div className="w-14 h-14 rounded-full border-2 border-[#b88c4b] bg-[#f7eedc]/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-[#f3cf8a] group-hover:bg-[#f7eedc]/20 transition-all duration-300 shadow-[0_0_20px_rgba(184,140,75,0.2)]">
              <ChevronRight className="h-6 w-6 text-[#f3cf8a] transition-transform duration-300 group-hover:translate-x-1" />
            </div>

            <span className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#f3cf8a] drop-shadow-sm">
              Imperial Archives
            </span>
            <span className="font-garamond text-xs sm:text-sm italic text-[#d4b48d] mt-1.5">
              Access All Sacred Chronicles
            </span>

            <div className="mt-3 flex items-center gap-2 text-[#b88c4b]">
              <div className="h-px w-8 bg-current opacity-60" />
              <span className="text-[9px] text-[#f3cf8a]">✦</span>
              <div className="h-px w-8 bg-current opacity-60" />
            </div>
          </Link>
        </div>

        {/* Bottom Imperial Portal Button */}
        <div className="mt-12 flex justify-center">
          <Link
            to="/gallery"
            onPointerEnter={() => preloadPublicRoute("/gallery")}
            onFocus={() => preloadPublicRoute("/gallery")}
            className="group relative inline-flex h-11 sm:h-12 w-auto max-w-[92vw] sm:max-w-none items-center justify-center overflow-hidden rounded-sm border-2 border-[#b8863b] bg-gradient-to-b from-[#fbf2e0]/95 via-[#faeed7]/90 to-[#f3dfbc]/95 px-3.5 sm:px-8 py-0 font-cinzel text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.24em] text-[#422209] shadow-[0_12px_28px_rgba(35,15,5,0.3),inset_0_1px_1px_rgba(255,255,255,0.7)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8c5824] hover:bg-[#f5dfb8] hover:shadow-[0_0_22px_rgba(200,140,50,0.35),0_14px_32px_rgba(40,15,5,0.3)] active:translate-y-0 active:scale-[0.98] focus:outline-none cursor-pointer box-border"
            style={{
              backgroundImage: "url('/media/common/textures/parchment-bg-20261026.webp')",
              backgroundSize: "cover",
              backgroundBlendMode: "overlay",
            }}
          >
            {/* Inner Hairline Frame */}
            <span
              className="pointer-events-none absolute inset-[3px] border border-[#a87430]/35 transition-colors duration-300 group-hover:border-[#a87430]/65"
              aria-hidden="true"
            />

            {/* 4 Corner Diamond Rivets */}
            <span
              className="pointer-events-none absolute left-1 top-1 text-[7px] sm:text-[8px] leading-none text-[#9b6628] transition-colors group-hover:text-[#5a2e0a]"
              aria-hidden="true"
            >
              ◆
            </span>
            <span
              className="pointer-events-none absolute right-1 top-1 text-[7px] sm:text-[8px] leading-none text-[#9b6628] transition-colors group-hover:text-[#5a2e0a]"
              aria-hidden="true"
            >
              ◆
            </span>
            <span
              className="pointer-events-none absolute bottom-1 left-1 text-[7px] sm:text-[8px] leading-none text-[#9b6628] transition-colors group-hover:text-[#5a2e0a]"
              aria-hidden="true"
            >
              ◆
            </span>
            <span
              className="pointer-events-none absolute bottom-1 right-1 text-[7px] sm:text-[8px] leading-none text-[#9b6628] transition-colors group-hover:text-[#5a2e0a]"
              aria-hidden="true"
            >
              ◆
            </span>

            {/* Warm Golden Shimmer Sweep (No harsh white) */}
            <span
              className="pointer-events-none absolute -inset-full h-auto w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[#ffe7b8]/25 to-transparent transition-all duration-1000 ease-out group-hover:left-full"
              aria-hidden="true"
            />

            {/* Content — Centered lockup matching Teaser button */}
            <span className="relative z-10 flex items-center justify-center gap-2.5 leading-none text-center">
              {/* Golden Action Badge */}
              <span
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 shrink-0 items-center justify-center rounded-full border border-[#8c5824] bg-gradient-to-b from-[#b8863b] to-[#7a4816] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-[#5a2e0a] group-hover:shadow-[0_0_8px_rgba(184,134,59,0.7)]"
                aria-hidden="true"
              >
                <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#faeed7] stroke-[2.5] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span className="whitespace-nowrap leading-none drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                Explore All Imperial Chronicles
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

const ArtistSection = () => {
  return (
    <section
      id="artist"
      className="relative bg-cover bg-center pt-6 pb-8 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-14 overflow-hidden select-none"
      style={{ backgroundImage: "url('/media/common/textures/parchment-bg-20261026.webp')" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading matching the Antique Lineup Poster */}
        <div className="mb-12 text-center sm:mb-16">
          <div className="my-3 flex select-none items-center justify-center">
            <div className="flex w-full max-w-xl items-center justify-center gap-3 px-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8c6536] to-[#8c6536]" />
              <div className="font-cinzel flex shrink-0 items-center gap-2 text-xs font-semibold uppercase leading-none tracking-[0.3em] text-[#7d5628]">
                <span className="inline-flex items-center leading-none">✦</span>
                <span>Celebrity Night</span>
                <span className="inline-flex items-center leading-none">✦</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8c6536] to-[#8c6536]" />
            </div>
          </div>

          <h2 className="font-cinzel mt-3 text-3xl font-black uppercase tracking-[0.11em] text-[#2c1d0c] drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl section-title">
            The Main Performer
          </h2>
          <div className="mt-4 flex justify-center">
            <LaurelDivider />
          </div>
        </div>

        {/* The Two Main Performer Cards + Compass Divider */}
        <div className="artist-cards-container relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 lg:gap-8">
          {/* --- CULRAV CARD --- */}
          <div className="artist-card-left relative w-full max-w-[380px] sm:max-w-[420px]">
            {/* Card Base Artwork — Scales Entire Stele on Hover */}
            <div className="group relative rounded-lg transform-gpu transition-all duration-500 ease-out hover:scale-[1.03] hover:-translate-y-2 hover:drop-shadow-[0_24px_48px_rgba(215,95,15,0.42)] cursor-pointer">
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src="/media/homepage/images/card_culrav_clean.webp"
                  alt="Culrav Main Performer"
                  className="w-full h-auto object-contain select-none"
                />

                {/* Mystical Sunburst Glow behind Arch on Hover */}
                <div className="pointer-events-none absolute top-[18%] left-[20%] right-[20%] h-[48%] rounded-t-full bg-gradient-to-t from-transparent via-[#e87a28]/15 to-[#f3cf8a]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />

                {/* Plinth Text Box ("COMING SOON") */}
                <div className="absolute top-[78.4%] left-[14%] right-[14%] h-[7.8%] flex items-center justify-center pointer-events-none">
                  <span className="font-cinzel text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.25em] text-[#341e0d] transition-all duration-500 filter blur-[0.4px] group-hover:blur-0 group-hover:text-[#934411] group-hover:tracking-[0.3em]">
                    ✦ COMING SOON ✦
                  </span>
                </div>

                {/* Bottom Realm Label ("CULRAV" in Pure Text) */}
                <div className="absolute top-[88.8%] inset-x-0 h-[4.2%] flex items-center justify-center pointer-events-none">
                  <span className="font-cinzel text-xs sm:text-sm font-black uppercase tracking-[0.35em] text-[#8c4314] transition-colors duration-300 group-hover:text-[#ba5a16]">
                    CULRAV
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* --- CENTER DIVIDER: COMPASS STAR (Desktop Only) --- */}
          <div className="artist-compass hidden md:flex flex-col items-center justify-center my-auto px-1 lg:px-2 pointer-events-none select-none">
            <img
              src="/media/homepage/images/compass_divider.webp"
              alt="Antique Compass Divider"
              className="h-[420px] lg:h-[480px] w-auto object-contain opacity-85 transition-opacity duration-500 hover:opacity-100"
            />
          </div>

          {/* Mobile Divider (Mobile Only) */}
          <div className="flex md:hidden items-center justify-center gap-3 w-full max-w-xs my-1 select-none">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8c6536] to-[#8c6536]" />
            <span className="text-[#a85a18] text-xs">✦</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8c6536] to-[#8c6536]" />
          </div>

          {/* --- AVISHKAR CARD --- */}
          <div className="artist-card-right relative w-full max-w-[380px] sm:max-w-[420px]">
            {/* Card Base Artwork — Scales Entire Stele on Hover */}
            <div className="group relative rounded-lg transform-gpu transition-all duration-500 ease-out hover:scale-[1.03] hover:-translate-y-2 hover:drop-shadow-[0_24px_48px_rgba(110,45,170,0.38)] cursor-pointer">
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src="/media/homepage/images/card_avishkar_clean.webp"
                  alt="Avishkar Main Performer"
                  className="w-full h-auto object-contain select-none"
                />

                {/* Mystical Amethyst Laurel Glow behind Arch on Hover */}
                <div className="pointer-events-none absolute top-[18%] left-[20%] right-[20%] h-[48%] rounded-t-full bg-gradient-to-t from-transparent via-[#7645a8]/15 to-[#b894e6]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />

                {/* Plinth Text Box ("COMING SOON") */}
                <div className="absolute top-[78.4%] left-[14%] right-[14%] h-[7.8%] flex items-center justify-center pointer-events-none">
                  <span className="font-cinzel text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.25em] text-[#341e0d] transition-all duration-500 filter blur-[0.4px] group-hover:blur-0 group-hover:text-[#5c3e7d] group-hover:tracking-[0.3em]">
                    ✦ COMING SOON ✦
                  </span>
                </div>

                {/* Bottom Realm Label ("AVISHKAR" in Pure Text) */}
                <div className="absolute top-[88.8%] inset-x-0 h-[4.2%] flex items-center justify-center pointer-events-none">
                  <span className="font-cinzel text-xs sm:text-sm font-black uppercase tracking-[0.35em] text-[#56377a] transition-colors duration-300 group-hover:text-[#7f4bb5]">
                    AVISHKAR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Twilight Announcement Plaque */}
        <div className="mt-12 sm:mt-16 flex justify-center">
          <div
            className="relative inline-flex h-11 sm:h-12 w-auto max-w-[92vw] sm:max-w-none items-center justify-center overflow-hidden rounded-sm border-2 border-[#b8863b] bg-gradient-to-b from-[#fbf2e0]/95 via-[#faeed7]/90 to-[#f3dfbc]/95 px-4 sm:px-8 py-0 font-cinzel text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-[#3d220f] shadow-[0_10px_24px_rgba(35,15,5,0.2),inset_0_1px_1px_rgba(255,255,255,0.7)] backdrop-blur-md box-border select-none pointer-events-none"
            style={{
              backgroundImage: "url('/media/common/textures/parchment-bg-20261026.webp')",
              backgroundSize: "cover",
              backgroundBlendMode: "overlay",
            }}
          >
            {/* Inner Hairline Frame */}
            <span
              className="pointer-events-none absolute inset-[3px] border border-[#a87430]/35"
              aria-hidden="true"
            />

            {/* 4 Corner Diamond Rivets */}
            <span
              className="pointer-events-none absolute left-1 top-1 text-[7px] sm:text-[8px] leading-none text-[#9b6628]"
              aria-hidden="true"
            >
              ◆
            </span>
            <span
              className="pointer-events-none absolute right-1 top-1 text-[7px] sm:text-[8px] leading-none text-[#9b6628]"
              aria-hidden="true"
            >
              ◆
            </span>
            <span
              className="pointer-events-none absolute bottom-1 left-1 text-[7px] sm:text-[8px] leading-none text-[#9b6628]"
              aria-hidden="true"
            >
              ◆
            </span>
            <span
              className="pointer-events-none absolute bottom-1 right-1 text-[7px] sm:text-[8px] leading-none text-[#9b6628]"
              aria-hidden="true"
            >
              ◆
            </span>

            {/* Pure Typographic Content — Center Aligned on All Screens */}
            <div className="relative z-10 flex h-full w-full items-center justify-center text-center leading-none">
              <span
                className="hidden sm:inline-block h-px w-5 mr-3 bg-gradient-to-r from-transparent to-[#9b6628]/60"
                aria-hidden="true"
              />
              <span
                className="font-black text-center whitespace-nowrap leading-none drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]"
                style={{ WebkitTextStroke: "0.25px currentColor" }}
              >
                To Be Unveiled at Twilight
              </span>
              <span
                className="hidden sm:inline-block h-px w-5 ml-3 bg-gradient-to-l from-transparent to-[#9b6628]/60"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- GREEK DECORATIONS FOR FOOTER ---
const CompassRose = ({ className = "w-8 h-8 text-[#8c6536]" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <circle
      cx="50"
      cy="50"
      r="42"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="3 3"
    />
    <circle
      cx="50"
      cy="50"
      r="34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    />
    <polygon points="50,10 54,46 50,42" fill="currentColor" />
    <polygon points="50,10 46,46 50,42" fill="currentColor" opacity="0.6" />
    <polygon points="50,90 54,54 50,58" fill="currentColor" opacity="0.6" />
    <polygon points="50,90 46,54 50,58" fill="currentColor" />
    <polygon points="90,50 54,54 58,50" fill="currentColor" />
    <polygon points="90,50 54,46 58,50" fill="currentColor" opacity="0.6" />
    <polygon points="10,50 46,54 42,50" fill="currentColor" opacity="0.6" />
    <polygon points="10,50 46,46 42,50" fill="currentColor" />
    <polygon points="78,22 53,47 56,44" fill="currentColor" />
    <polygon points="78,22 47,53 56,44" fill="currentColor" opacity="0.6" />
    <polygon points="22,78 47,53 44,56" fill="currentColor" />
    <polygon points="22,78 53,47 44,56" fill="currentColor" opacity="0.6" />
    <polygon points="78,78 53,53 56,56" fill="currentColor" />
    <polygon points="78,78 47,47 56,56" fill="currentColor" opacity="0.6" />
    <polygon points="22,22 47,47 44,44" fill="currentColor" />
    <polygon points="22,22 53,53 44,44" fill="currentColor" opacity="0.6" />
    <circle cx="50" cy="50" r="3.5" fill="currentColor" />
  </svg>
);

const CulravSun = ({ className = "w-5 h-5 text-[#c4681f]" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <circle
      cx="50"
      cy="50"
      r="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    />
    <circle cx="50" cy="50" r="12" opacity="0.3" />
    <circle cx="50" cy="50" r="6" />
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="50,5 53,24 47,24" />
      <polygon points="95,50 76,53 76,47" />
      <polygon points="50,95 47,76 53,76" />
      <polygon points="5,50 24,47 24,53" />
      <polygon points="82,18 70,33 65,28" />
      <polygon points="82,82 67,70 72,65" />
      <polygon points="18,82 33,70 28,65" />
      <polygon points="18,18 30,33 35,28" />
    </g>
  </svg>
);

const AvishkarLaurel = ({ className = "w-5 h-5 text-[#463270]" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path
      d="M50 88C30 80 18 60 22 34c2-10 8-18 16-24M50 88c20-8 32-28 28-54-2-10-8-18-16-24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M24 76c-6-2-10-8-6-12 4 0 7 6 6 12Zm4 2c4-4 5-11 0-14-3 4-3 10 0 14ZM18 60c-6-2-9-9-4-13 5 1 7 7 4 13Zm5 2c5-5 5-12 0-15-3 4-2 11 0 15ZM17 44c-6-3-8-11-2-14 5 2 6 9 2 14Zm6 2c4-6 5-13-1-16-3 4-2 11 1 16ZM22 28c-5-5-4-12 2-14 4 4 3 10-2 14Zm7 2c4-7 6-14 0-16-3 4-3 12 0 16Zm4-14c-3-6 0-11 6-10 2 4-1 10-6 10ZM76 76c6-2 10-8 6-12-4 0-7 6-6 12Zm-4 2c-4-4-5-11 0-14 3 4 3 10 0 14Zm10-18c6-2 9-9 4-13-5 1-7 7-4 13Zm-5 2c-5-5-5-12 0-15 3 4 2 11 0 15Zm6-18c6-3 8-11 2-14-5 2-6 9-2 14Zm-6 2c-4-6-5-13 1-16 3 4 2 11-1 16Zm1-18c5-5 4-12-2-14-4 4-3 10 2 14Zm-7 2c-4-7-6-14 0-16 3 4 3 12 0 16Zm-4-14c3-6 0-11-6-10-2 4 1 10 6 10Z" />
    <circle cx="50" cy="88" r="3.5" />
  </svg>
);

function Footer() {
  return (
    <footer className="relative bg-[#edd8b1] text-[#2c1d0c] pt-10 pb-16 sm:pt-16 sm:pb-16 overflow-hidden border-t-2 border-[#b58b4f] select-none">
      {/* High-Resolution Parchment Footer Background from uploaded asset */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="/media/homepage/images/footer-bg-20261026.webp"
          onError={(e) => {
            const target = e.target;
            if (!target.src.includes("Footer.png")) {
              target.src = "/Footer.png";
            }
          }}
          alt="Ancient Parchment Footer"
          className="w-full h-full object-cover object-bottom"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Main 3-Column Layout: Brand, Explore, and The Imperial Citadel */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-12 gap-x-5 gap-y-8 sm:gap-8 lg:gap-10 pb-5 sm:pb-14 items-start">
          {/* Column 1: Brand Lockup (md:col-span-5 lg:col-span-4) */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-4 flex flex-col items-start">
            {/* Sub-crest: CULRAV x AVISHKAR using IcarusSun & TwinLeaves */}
            <div className="mt-0 sm:mt-6 flex items-center gap-5 sm:gap-6">
              {/* Culrav Emblem + Label */}
              <div className="flex flex-col items-center gap-1.5 group cursor-default">
                <img
                  src="/media/homepage/images/IcarusSun.webp"
                  alt="Culrav Emblem"
                  className="w-11 h-11 sm:w-12 sm:h-12 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(160,70,10,0.2)]"
                />
                <span className="font-cinzel text-xs font-bold tracking-[0.25em] uppercase text-[#9e4a13]">
                  Culrav
                </span>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-[#8c6536]/60 to-transparent" />

              {/* Avishkar Emblem + Label */}
              <div className="flex flex-col items-center gap-1.5 group cursor-default">
                <img
                  src="/media/homepage/images/TwinLeaves.webp"
                  alt="Avishkar Emblem"
                  className="w-11 h-11 sm:w-12 sm:h-12 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(70,30,100,0.2)]"
                />
                <span className="font-cinzel text-xs font-bold tracking-[0.25em] uppercase text-[#4d2f70]">
                  Avishkar
                </span>
              </div>
            </div>

            <p className="font-garamond text-base sm:text-xl text-[#5e3f20] mt-2 tracking-wide">
              Forged in myth, powered by innovation. An epic convergence of
              technology and culture.
            </p>
          </div>

          {/* Column 2: EXPLORE (md:col-span-3 lg:col-span-3) */}
          <div className="sm:col-span-1 md:col-span-3 lg:col-span-3 flex flex-col md:pl-8 lg:pl-28 xl:pl-48">
            <div className="mb-3 sm:mb-4">
              <h4 className="font-cinzel text-[10px] sm:text-xs font-bold tracking-[0.18em] sm:tracking-[0.28em] uppercase text-[#3b220d]">
                Explore
              </h4>
              <div className="h-[1px] w-12 bg-[#8c6536] mt-1.5" />
            </div>

            <nav className="flex flex-col space-y-1.5 sm:space-y-2 text-[13px] sm:text-base font-garamond font-semibold text-[#4a2e16]">
              <Link
                to="/avishkar"
                onPointerEnter={() => preloadPublicRoute("/avishkar")}
                className="hover:text-[#463270] transition-colors py-0.5"
              >
                Avishkar
              </Link>
              <Link
                to="/culrav"
                onPointerEnter={() => preloadPublicRoute("/culrav")}
                className="hover:text-[#c4681f] transition-colors py-0.5"
              >
                Culrav
              </Link>
              <Link
                to="/login"
                className="hover:text-[#c4681f] transition-colors py-0.5"
              >
                Register
              </Link>
              <Link
                to="/sponsors"
                className="hover:text-[#c4681f] transition-colors py-0.5"
              >
                Sponsor
              </Link>
              <Link
                to="/team"
                onPointerEnter={() => preloadPublicRoute("/team")}
                className="hover:text-[#c4681f] transition-colors py-0.5"
              >
                Team
              </Link>
              <Link
                to="/gallery"
                onPointerEnter={() => preloadPublicRoute("/gallery")}
                className="hover:text-[#c4681f] transition-colors py-0.5"
              >
                Gallery
              </Link>
            </nav>
          </div>

          {/* Center Astrolabe Axis (Between Explore and Citadel) */}
          <div className="hidden md:flex md:col-span-1 lg:col-span-1 justify-center items-center h-48 pointer-events-none">
            <div className="flex flex-col items-center h-full justify-between">
              <div className="w-[1px] h-14 bg-gradient-to-b from-transparent to-[#8c6536]" />
              <CompassRose className="w-8 h-8 text-[#8c6536]" />
              <div className="w-[1px] h-14 bg-gradient-to-b from-[#8c6536] to-transparent" />
            </div>
          </div>

          {/* Column 3: THE IMPERIAL CITADEL & SOCIAL (md:col-span-4 lg:col-span-4) */}
          <div className="sm:col-span-1 md:col-span-4 lg:col-span-4 flex flex-col">
            <div className="mb-3 sm:mb-4">
              <h4 className="font-cinzel text-[10px] sm:text-xs font-bold tracking-[0.18em] sm:tracking-[0.28em] uppercase text-[#3b220d]">
                The Imperial Citadel
              </h4>
              <div className="h-[1px] w-12 bg-[#8c6536] mt-1.5" />
            </div>

            {/* Address of MNNIT Allahabad */}
            <div className="space-y-1 text-[13px] sm:text-base font-garamond font-semibold text-[#4a2e16] mb-3">
              <p className="font-bold text-[#321c0b] text-sm sm:text-base">
                Motilal Nehru National Institute of Technology
              </p>
              <p className="text-[#5e3f20] leading-relaxed text-xs sm:text-sm">
                Teliarganj, Prayagraj (Allahabad)
                <br />
                Uttar Pradesh, India — 211004
              </p>
            </div>

            {/* Direct Mail & Instagram Handles */}
            <div className="space-y-1.5 mb-4 text-[13px] sm:text-sm font-garamond font-semibold text-[#4a2e16]">
              <a
                href="mailto:culrav@mnnit.ac.in"
                className="flex items-center gap-2 hover:text-[#c4681f] transition-colors group/item"
              >
                <Mail className="w-4 h-4 text-[#8c6536] transition-transform group-hover/item:scale-110" />
                <span>culrav@mnnit.ac.in</span>
              </a>
              <a
                href="https://www.instagram.com/culrav/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#c4681f] transition-colors group/item"
              >
                <Instagram className="w-4 h-4 text-[#8c6536] transition-transform group-hover/item:scale-110" />
                <span>@culrav</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Line & Web Team Credit */}
        <div className="border-t border-[#bfa275]/60 pt-4 sm:pt-6 pb-2 -mt-3 sm:mt-0 -translate-y-3 sm:translate-y-0 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-center text-[11px] sm:text-xs font-cinzel font-semibold tracking-[0.2em] text-[#6e4e2a] uppercase md:px-8 lg:px-16 xl:px-24">
          <p className="flex items-center justify-center gap-1.5">
            <span>© 2026 Echoes of Olympus. All Rights Reserved.</span>
          </p>
          <p className="flex items-center justify-center gap-1.5 text-[#5e3f20]">
            <span>Made with</span>
            <span className="text-red-600 animate-pulse text-sm">❤️</span>
            <span>by Web Team</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// --- MAIN APP COMPONENT ---

export default function App() {
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pageRef = useRef(null);

  // Trigger Animations
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      // Navbar
      gsap.from(".logo-trigger", {
        duration: 0.55,
        y: -14,
        opacity: 0,
        ease: "power3.out",
      });

      // Hero
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.from(
        ".hero-title",
        { duration: 0.82, y: 28, opacity: 0 },
      )
        .from(
          ".hero-sub",
          { duration: 0.52, opacity: 0, y: 14 },
          "-=0.3",
        )
        .from(
          ".hero-btns",
          { duration: 0.48, opacity: 0, y: 12 },
          "-=0.22",
        );

      // Section Titles
      gsap.utils.toArray(".section-title").forEach((title) => {
        gsap.from(title, {
          scrollTrigger: {
            trigger: title,
            start: "top 88%",
            once: true,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
          y: 30,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
        });
      });

      // About Cards (The Two Realms: Culrav & Avishkar)
      const tlAbout = gsap.timeline({
        scrollTrigger: {
          trigger: ".about-cards-container",
          start: "top 88%",
          once: true,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      tlAbout
        .fromTo(
          ".about-card-left",
          {
            y: 28,
            autoAlpha: 0,
            willChange: "transform, opacity",
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.76,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility,willChange",
          },
          0,
        )
        .fromTo(
          ".about-card-right",
          {
            y: 28,
            autoAlpha: 0,
            willChange: "transform, opacity",
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.76,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility,willChange",
          },
          0.1,
        );

      // Artist Section (The Main Performer: Culrav & Avishkar Lineup Posters)
      const tlArtist = gsap.timeline({
        scrollTrigger: {
          trigger: ".artist-cards-container",
          start: "top 88%",
          once: true,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      tlArtist
        .fromTo(
          ".artist-card-left",
          {
            y: 28,
            autoAlpha: 0,
            willChange: "transform, opacity",
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.76,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility,willChange",
          },
          0,
        )
        .fromTo(
          ".artist-compass",
          {
            scale: 0.88,
            rotation: -8,
            autoAlpha: 0,
            willChange: "transform, opacity",
          },
          {
            scale: 1,
            rotation: 0,
            autoAlpha: 1,
            duration: 0.62,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility,willChange",
          },
          0.05,
        )
        .fromTo(
          ".artist-card-right",
          {
            y: 28,
            autoAlpha: 0,
            willChange: "transform, opacity",
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.76,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility,willChange",
          },
          0.1,
        );

      // Gallery Stagger
    }, pageRef);

    const refresh = () => ScrollTrigger.refresh();
    const refreshFrame = window.requestAnimationFrame(refresh);
    window.addEventListener("load", refresh, { once: true });

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      window.removeEventListener("load", refresh);
      context.revert();
    };
  }, []);

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden"
    >
      {/* Styles */}
      <style>{`
        .font-sans { font-family: var(--font-display); }
        .font-mono { font-family: var(--font-mono); }

        /* Custom Animations */
        .bg-grid-pattern {
          background-size: 50px 50px;
          background-image: linear-gradient(to right, rgba(34, 211, 238, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
        }
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        .animate-grid-move { animation: grid-move 4s linear infinite; }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Glitch Animations */
        @keyframes glitch-1 {
          0% { clip-path: inset(20% 0 80% 0); }
          20% { clip-path: inset(60% 0 10% 0); }
          100% { clip-path: inset(30% 0 50% 0); }
        }
        @keyframes glitch-2 {
          0% { clip-path: inset(10% 0 60% 0); }
          20% { clip-path: inset(30% 0 20% 0); }
          100% { clip-path: inset(0% 0 80% 0); }
        }
        .animate-glitch-1 { animation: glitch-1 2.5s infinite linear alternate-reverse; }
        .animate-glitch-2 { animation: glitch-2 3s infinite linear alternate-reverse; }
        
        /* Scanlines */
        .scanlines {
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3));
          background-size: 100% 3px;
        }
      `}</style>

      {/* <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      /> */}

      <main>
        <HeroSection />
        <RealmSeparator />
        <AboutSection />
        <GallerySection />
        <ArtistSection />
      </main>

      <Footer />
    </div>
  );
}
