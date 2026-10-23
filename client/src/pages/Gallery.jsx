import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Maximize2, X, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import galleryImg1 from "../assets/pages/gallery/galleryImg1.jpg";
import galleryImg1Thumb from "../assets/pages/gallery/galleryImg1-thumb.webp";
import galleryImg3 from "../assets/pages/gallery/galleryImg3.jpg";
import galleryImg4 from "../assets/pages/gallery/galleryImg4.jpg";
import galleryImg5 from "../assets/pages/gallery/galleryImg5.jpg";
import galleryImg6 from "../assets/pages/gallery/galleryImg6.webp";
import galleryImg7 from "../assets/pages/gallery/galleryImg7.webp";
import galleryImg8 from "../assets/pages/gallery/galleryImg8.webp";
import galleryImg9 from "../assets/pages/gallery/galleryImg9.jpg";
import galleryImg10 from "../assets/pages/gallery/galleryImg10.webp";
import galleryImg11 from "../assets/pages/gallery/galleryImg11.jpg";
import lashcurryImg from "../assets/pages/gallery/lashcurry.webp";
import lashcurryFullImg from "../assets/pages/gallery/lashcurry-full.webp";
import pranavSharmaImg from "../assets/pages/gallery/pranav sharma.webp";
import pranavSharmaFullImg from "../assets/pages/gallery/pranav sharma-full.webp";
import pragatiNagpalImg from "../assets/pages/gallery/pragati nagpal.webp";
import pragatiNagpalFullImg from "../assets/pages/gallery/pragati nagpal-full.webp";
import javedAliImg from "../assets/pages/gallery/javed ali.webp";
import javedAliThumb from "../assets/pages/gallery/javed ali-thumb.webp";
import maahiImg from "../assets/pages/gallery/maahi.webp";
import maahiFullImg from "../assets/pages/gallery/maahi-full.webp";
import galleryImg10Full from "../assets/pages/gallery/galleryImg10-full.webp";


// Classical Laurel Divider matching Homepage Visual Archives
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

const GALLERY_ITEMS = [
  {
    id: 1,
    staticSrc: javedAliThumb,
    fullSrc: javedAliImg,
    title: "Javed Ali",
    subtitle: "Maestro of Soulful Sufi & Bollywood Melodies",
    act: "PRO-NITE",
    numeral: "I",
    text: "Renowned Indian playback singer and live performer known for his timeless, soul-stirring classics such as 'Kun Faya Kun', 'Jashn-E-Bahaara', and 'Srivalli'. His emotive vocal depth, classical mastery, and spellbinding stage presence have mesmerized audiences across generations.",
    // Grand 2x2 Bento Anchor (Left)
    gridClass: "col-span-1 md:col-span-2 lg:col-span-2 md:row-span-2 lg:row-span-2",
    imageClass: "object-center",
  },
  {
    id: 2,
    staticSrc: galleryImg1Thumb,
    fullSrc: galleryImg1,
    title: "Mohit Chauhan",
    subtitle: "Soulful Melodies & Timeless Harmonies",
    act: "PRO-NITE",
    numeral: "II",
    text: "Mohit Chauhan is one of India’s most loved playback singers, known for his soulful tone and heartfelt melodies. With chart-topping hits across decades, his voice has become a defining sound of modern Indian music. Live or recorded, his performances carry emotion, nostalgia, and timeless charm.",
    // Widescreen 2x1 Landscape Banner (mohit chauhan grid in landscape)
    gridClass: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1",
    imageClass: "object-[center_20%]",
  },
  {
    id: 6,
    staticSrc: maahiImg,
    fullSrc: maahiFullImg,
    title: "Maahi",
    subtitle: "Breakout Pop Voice & Acoustic Melodist",
    act: "UNPLUGGED",
    numeral: "III",
    text: "Maahi Mukherjee is a sensational Indian singer, songwriter, and performer who captured hearts with his breakthrough single 'Sorry'. Bringing a fresh acoustic touch and undeniable warmth to contemporary pop, his live sets deliver an unforgettable musical experience.",
    // Widescreen 2x1 Landscape Banner in Line 2
    gridClass: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1",
    imageClass: "object-[center_20%]",
  },
  {
    id: 4,
    staticSrc: galleryImg8,
    title: "Suhani Shah",
    subtitle: "Mind Reader & Illusionist Maestro",
    act: "ILLUSION",
    numeral: "IV",
    text: "India’s Leading Illusionist & Mentalist. Captivating audiences with mind-reading, psychological tricks, and immersive storytelling. She is a trailblazer in modern magic, redefining mentalism across the country.",
    // Tall 1x2 Vertical Portrait Column (suhani shah inpotrait)
    gridClass: "col-span-1 md:col-span-1 lg:col-span-1 md:row-span-2 lg:row-span-2",
    imageClass: "object-[center_20%]",
  },
  {
    id: 5,
    staticSrc: galleryImg11,
    title: "Mame Khan",
    subtitle: "The Voice of the Thar Desert",
    act: "FOLK FUSION",
    numeral: "V",
    text: "From Coke Studio to international festivals, he continues to redefine Indian folk with unmatched energy and emotion. Carrying generations of royal Manganiyar heritage, his electrifying performances transform desert lore into a global musical sensation.",
    // Widescreen 2x1 Landscape Banner
    gridClass: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1",
    imageClass: "object-center",
  },
  {
    id: 3,
    staticSrc: galleryImg10,
    fullSrc: galleryImg10Full,
    title: "Monali Thakur",
    subtitle: "National Award–Winning Playback Sensation",
    act: "STAR NITE",
    numeral: "VI",
    text: "National Award–Winning Playback Sensation. A versatile singer with an expressive voice and wide musical range. Her songs blend clarity, finesse, and emotion, leaving crowds spellbound across India.",
    // Compact 1x1 Accent Square in Line 3
    gridClass: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    imageClass: "object-center",
  },
  {
    id: 7,
    staticSrc: galleryImg6,
    title: "Ashish Solanki",
    subtitle: "Comicstaan Champion & Stand-Up Powerhouse",
    act: "COMEDY",
    numeral: "VII",
    text: "Comicstaan Champion & Stand-Up Powerhouse. Ashish brings bold humour, sharp punchlines, and high energy to every stage. His performances are fast-paced, fearless, and always crowd-pleasing.",
    // Widescreen 2x1 Landscape Banner
    gridClass: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1",
    imageClass: "object-[center_25%]",
  },
  {
    id: 8,
    staticSrc: galleryImg7,
    title: "Tigmanshu Dhulia",
    subtitle: "Visionary Filmmaker & Cinematic Legend",
    act: "CINEMA",
    numeral: "VIII",
    text: "Visionary Filmmaker & Actor. Celebrated for his bold storytelling and realistic cinematic style. With acclaimed films and memorable roles, he has shaped contemporary Indian cinema and redefined narrative realism.",
    // Compact 1x1 Accent Square in Line 2
    gridClass: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    imageClass: "object-center",
  },
  {
    id: 9,
    staticSrc: pranavSharmaImg,
    fullSrc: pranavSharmaFullImg,
    title: "Pranav Sharma",
    subtitle: "Observational Comedy & Sharp Wit Maestro",
    act: "STANDUP",
    numeral: "IX",
    text: "Celebrated stand-up comedian and storyteller known for relatable observations, quick wit, and unstoppable crowd energy. His hilarious anecdotes on youth, modern life, and relationships keep auditoriums roaring with laughter.",
    // Tall 1x2 Vertical Portrait Column
    gridClass: "col-span-1 md:col-span-1 lg:col-span-1 md:row-span-2 lg:row-span-2",
    imageClass: "object-[center_20%]",
  },
  {
    id: 10,
    staticSrc: galleryImg9,
    title: "Nalayak",
    subtitle: "Revolutionary Indie Rock Sensations",
    act: "INDIE ROCK",
    numeral: "X",
    text: "India’s Raw & Revolutionary Indie Rock Band. A sensation in the indie scene with high-voltage performances and honest music. Their sound blends raw emotion with rebellious energy.",
    // Grand 2x2 Feature (height increased)
    gridClass: "col-span-1 md:col-span-2 lg:col-span-2 md:row-span-2 lg:row-span-2",
    imageClass: "object-center",
  },
  {
    id: 11,
    staticSrc: galleryImg3,
    title: "Rajat Chauhan",
    subtitle: "The Relatable Comedy Storyteller",
    act: "STANDUP",
    numeral: "XI",
    text: "The Relatable Comedy Storyteller. Known for his clean, witty humour and everyday observations, his effortless storytelling makes him a favourite among audiences of all ages.",
    // Tall 1x2 Vertical Portrait Column
    gridClass: "col-span-1 md:col-span-1 lg:col-span-1 md:row-span-2 lg:row-span-2",
    imageClass: "object-[center_20%]",
  },
  {
    id: 12,
    staticSrc: pragatiNagpalImg,
    fullSrc: pragatiNagpalFullImg,
    title: "Pragati Nagpal",
    subtitle: "Vibrant Pop Sensation & Vocalist",
    act: "POP NITE",
    numeral: "XII",
    text: "A dynamic Gen-Z playback singer, songwriter, and performer captivating audiences nationwide. Known for chartbuster tracks like 'Aadatan' and electrifying live energy, she brings effortless charisma, vocal brilliance, and contemporary flair to the stage.",
    // Wide 2x1 Landscape Card (pragati-wide)
    gridClass: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1",
    imageClass: "object-[center_25%]",
  },
  {
    id: 13,
    staticSrc: galleryImg5,
    title: "Rakesh Addlakha",
    subtitle: "Rising Voice of Contemporary Melodies",
    act: "ACOUSTIC",
    numeral: "XIII",
    text: "Rising Voice of Contemporary Music. An emerging singer whose expressive tone and dynamic style connect instantly with listeners, blending melody, passion, and youthful freshness on stage.",
    // Tall 1x2 Vertical Portrait Column (rakesh-tall)
    gridClass: "col-span-1 md:col-span-1 lg:col-span-1 md:row-span-2 lg:row-span-2",
    imageClass: "object-center",
  },
  {
    id: 14,
    staticSrc: galleryImg4,
    title: "MS Bitta",
    subtitle: "Icon of Courage & National Resilience",
    act: "LEADERSHIP",
    numeral: "XIV",
    text: "Icon of Courage, Patriotism & Resilience. A respected national figure and survivor of violent attacks, he continues to inspire millions through his strength, leadership, and powerful speeches that echo devotion to the nation.",
    // Tall 1x2 Vertical Portrait Column
    gridClass: "col-span-1 md:col-span-1 lg:col-span-1 md:row-span-2 lg:row-span-2",
    imageClass: "object-center",
  },
  {
    id: 15,
    staticSrc: lashcurryImg,
    fullSrc: lashcurryFullImg,
    title: "Lashcurry",
    subtitle: "MTV Hustle Champion & Desi Hip-Hop Trailblazer",
    act: "HIP HOP",
    numeral: "XV",
    text: "Vinayak Lashkari, popularly known as Lashcurry, is an acclaimed rapper, songwriter, and the champion of MTV Hustle 4. Blending classical tabla training with raw street lyricism and hard-hitting flows, his high-octane anthems have redefined contemporary Indian hip-hop.",
    // Wide 2x1 Landscape Card
    gridClass: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1",
    imageClass: "object-center",
  },
];

const Gallery = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  // Lock body scroll when modal is open and handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedItem(null);
      }
    };

    if (selectedItem) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("gallery-viewer-open");
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove("gallery-viewer-open");
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("gallery-viewer-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem]);

  return (
    <div className="relative min-h-screen pt-28 pb-20 select-none overflow-x-clip bg-[#e9dec7]">
      {/* High-Performance Fixed Background Layer (Decoupled from document scroll, Zero Repaints) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/media/common/textures/parchment-bg.webp')",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading matching Homepage Visual Archives */}
        <div className="mb-10 text-center sm:mb-14">
          <div className="my-4 flex select-none flex-col items-center justify-center">
            <div className="flex w-full max-w-xl items-center justify-center gap-3 px-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8c6536] to-[#8c6536]" />
              <div className="font-cinzel flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#7d5628]">
                <span>✦</span>
                <span>The Colosseum Chronicles</span>
                <span>✦</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8c6536] to-[#8c6536]" />
            </div>
            <span className="font-cinzel mt-1 text-[11px] uppercase tracking-[0.3em] text-[#876233]">
              Chronicles of the Realm ✦ Captured in Time
            </span>
          </div>

          <h1 className="font-cinzel mt-3 text-3xl font-black uppercase tracking-[0.16em] text-[#2c1d0c] drop-shadow-sm sm:text-5xl md:text-6xl section-title">
            Visual Archives
          </h1>
        </div>

        {/* Bento Wall with Classical Roman Frames */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-flow-dense auto-rows-[250px] sm:auto-rows-[270px] lg:auto-rows-[280px] gap-4 sm:gap-5">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`group relative overflow-hidden rounded-xl border-2 border-[#b88c4b]/50 bg-[#140b04] cursor-pointer shadow-[0_8px_20px_rgba(44,29,12,0.18)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:z-30 hover:scale-[1.015] hover:border-[#f3cf8a] hover:shadow-[0_16px_36px_rgba(184,140,75,0.4)] ${item.gridClass} min-h-[260px] md:min-h-0 transform-gpu`}
              style={{
                contain: "paint layout",
                contentVisibility: "auto",
                containIntrinsicSize: "280px",
                transform: "translate3d(0, 0, 0)",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Double Inset Arch/Fillet border */}
              <div className="pointer-events-none absolute inset-2 z-20 rounded-lg border border-[#f3cf8a]/20 transition-colors duration-300 group-hover:border-[#f3cf8a]/60" />

              {/* Top-Left Roman Keystone Badge */}
              <div className="absolute top-3.5 left-3.5 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-[#f3cf8a]/40 bg-[#241508]/95 shadow-sm transition-transform duration-200 group-hover:scale-105 pointer-events-none">
                <span className="text-[9px] text-[#f3cf8a]">✦</span>
                <span className="font-cinzel text-[10px] font-bold tracking-widest text-[#f7eedc]">
                  {item.act} · {item.numeral}
                </span>
              </div>

              {/* Top-Right Quick Expand Icon (visible on hover) */}
              <div className="absolute top-3.5 right-3.5 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-y-1 group-hover:translate-y-0 pointer-events-none">
                <div className="flex items-center justify-center w-7 h-7 rounded-sm border border-[#f3cf8a]/40 bg-[#241508]/95 text-[#f3cf8a] shadow-sm">
                  <Maximize2 size={13} />
                </div>
              </div>

              {/* Full Color Image (No monochrome, No scratches, with async decoding & GPU acceleration) */}
              <img
                src={item.staticSrc}
                alt={item.title}
                className={`absolute inset-0 h-full w-full object-cover ${item.imageClass || "object-center"} transition-transform duration-500 ease-out group-hover:scale-105`}
                loading="lazy"
                decoding="async"
              />

              {/* Antique Parchment & Obsidian Vignette Overlay for Text Legibility */}
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#160b04] via-[#160b04]/30 to-transparent transition-opacity duration-300 opacity-65 md:opacity-80 md:group-hover:opacity-35" />

              {/* Idle State Label (Bottom-Left) */}
              <div className="absolute bottom-3.5 left-3.5 z-20 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none">
                <span className="font-cinzel text-xs font-bold tracking-wider text-[#f7eedc] bg-[#241508]/95 border border-[#b88c4b]/50 px-3 py-1 rounded-sm shadow-sm">
                  ✦ {item.title}
                </span>
              </div>

              {/* Hover Revealed Pedestal / Inscription */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-20 flex flex-col justify-end translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] text-[#f3cf8a]">✦</span>
                  <span className="font-cinzel text-[10px] uppercase tracking-[0.25em] text-[#d4a259]">
                    {item.act}
                  </span>
                </div>
                <h3 className="font-cinzel text-xl sm:text-2xl font-black uppercase tracking-wider text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] line-clamp-1">
                  {item.title}
                </h3>
                <div className="my-1.5 flex items-center gap-1.5 text-[#f3cf8a]">
                  <div className="h-px w-8 bg-current opacity-70" />
                  <span className="text-[8px]">✦</span>
                  <div className="h-px w-8 bg-current opacity-70" />
                </div>
                <p className="font-garamond text-xs sm:text-sm italic text-[#ebdcc0] line-clamp-2">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Imperial Portal Return Button */}
        <div className="mt-14 flex justify-center">
          <Link
            to="/"
            className="group/btn relative inline-flex items-center gap-3 border-2 border-[#b88c4b] bg-[#f7eedc]/95 px-8 py-3.5 font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#532e0e] shadow-[0_8px_25px_rgba(80,40,10,0.18)] transition-all hover:bg-[#fae6c6] hover:border-[#8c6536] hover:shadow-[0_14px_35px_rgba(80,40,10,0.28)] hover:-translate-y-0.5 active:scale-95"
          >
            <span className="pointer-events-none absolute inset-1 border border-[#b88c4b]/40" />
            <span className="text-[#a85a18] transition-transform group-hover/btn:-translate-x-1">
              ✦
            </span>
            <span>Return to Imperial Arena</span>
            <ArrowUpRight className="h-4 w-4 text-[#a85a18] transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Mythological Classical Modal Dialog */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-5xl rounded-md border-2 border-[#b88c4b] bg-gradient-to-b from-[#241307] via-[#160b04] to-[#0c0602] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(184,140,75,0.25)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Double Inset Arch/Fillet border */}
              <div className="pointer-events-none absolute inset-2 rounded-sm border border-[#f3cf8a]/30 z-30" />

              {/* Roman Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-40 p-2 rounded-sm border border-[#f3cf8a]/50 bg-[#2c1d0c]/90 text-[#f3cf8a] hover:bg-[#b88c4b] hover:text-[#160b04] transition-all shadow-md group cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-hidden">
                {/* Image Section */}
                <div className="h-[280px] sm:h-[360px] md:h-full md:min-h-[440px] relative bg-black flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-[#b88c4b]/30">
                  <img
                    src={selectedItem.fullSrc || selectedItem.staticSrc}
                    alt={selectedItem.title}
                    className={`w-full h-full object-cover ${selectedItem.imageClass || "object-center"}`}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#160b04]/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#160b04]/70" />
                </div>

                {/* Details Section */}
                <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center overflow-y-auto max-h-[85vh]">
                  {/* Roman Act Badge */}
                  <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-sm border border-[#f3cf8a]/40 bg-[#2c1d0c]/85 mb-3">
                    <span className="text-[9px] text-[#f3cf8a]">✦</span>
                    <span className="font-cinzel text-[10px] font-bold tracking-widest text-[#f7eedc]">
                      {selectedItem.act} · {selectedItem.numeral}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-cinzel text-2xl sm:text-4xl font-black uppercase text-white drop-shadow-md">
                    {selectedItem.title}
                  </h2>

                  {/* Ornamental Divider */}
                  <div className="my-3 flex items-center gap-2 text-[#f3cf8a]">
                    <div className="h-px w-10 bg-current opacity-70" />
                    <span className="text-[9px]">✦</span>
                    <div className="h-px w-10 bg-current opacity-70" />
                  </div>

                  {/* Subtitle */}
                  <p className="font-garamond text-base sm:text-lg italic text-[#d4a259] mb-4">
                    {selectedItem.subtitle}
                  </p>

                  {/* Full Text / Biography */}
                  <p className="font-garamond text-sm sm:text-base leading-relaxed text-[#ebdcc0]/90">
                    {selectedItem.text}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
