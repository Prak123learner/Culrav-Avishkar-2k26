// import { useState } from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

// function Navbar() {
//   const navigate = useNavigate();
//   const [isOpen, setIsOpen] = useState(false);
//   const { isAuthenticated, user } = useSelector((state) => state.auth);
//   const firstName = user?.name.split(" ")[0];

// const navItems = [
//   { name: "CULRAV", path: "/culrav" },
//   { name: "AVISHKAR", path: "/avishkar" },
//   { name: "GALLERY", path: "/gallery" },
//   { name: "TEAM", path: "/team" },
//   { name: "SPONSORS", path: "/sponsors" },
//   { name: "SCHEDULE", path: "/schedule" },
// ];

//   const handleNavigation = (path) => {
//     navigate(path);
//     setIsOpen(false);
//   };

//   return (
//     <nav className="relative top-0 left-0 w-full bg-gradient-to-r from-[#0a0a1a] via-[#101020] to-[#0a0a1a] backdrop-blur-md z-50 shadow-[0_0_25px_rgba(0,255,255,0.1)] border-b border-[#1a1a3d]">
//       <div className="flex items-center justify-between px-8 md:px-16 py-4">
//         {/* LOGO */}
//         <div
//           onClick={() => navigate("/")}
//           className="relative w-[110px] h-[45px] bg-white text-black font-bold text-sm cursor-pointer flex items-center justify-center   overflow-hidden"
//         >
//           <span className="text-white tracking-widest font-bebas text-lg z-10"></span>
//           <div className="absolute inset-0  opacity-0 hover:opacity-100 blur-sm transition-opacity duration-500"></div>
//         </div>

//         {/* Desktop Menu */}
//         <div className="hidden lg:flex flex-1 justify-between max-w-[70%]">
//           {navItems.map((item) => (
//             <div
//               key={item.name}
//               onClick={() => handleNavigation(item.path)}
//               className="group relative cursor-pointer"
//             >
//               <h1 className="text-[#d9faff] font-bebas tracking-wider text-lg transition-all duration-300 group-hover:text-[#00e5ff] group-hover:drop-shadow-[0_0_8px_#00e5ff]">
//                 {item.name}
//               </h1>
//               <span className="absolute left-0 bottom-[-3px] w-0 h-0.5 bg-linear-to-r from-[#00e5ff] to-[#7f00ff] transition-all duration-300 group-hover:w-full group-hover:shadow-[0_0_10px_#00e5ff]"></span>
//             </div>
//           ))}
//         </div>

//         {/* REGISTER BUTTON */}
//         <button
//           onClick={() =>
//             navigate(isAuthenticated ? "/dashboard/profile" : "/login")
//           }
//           className="hidden md:block bg-gradient-to-r from-[#1ba0af] to-[#7f00ff] text-white font-bold px-8 py-2   hover:scale-105 transition-all duration-300 font-bebas tracking-wider"
//         >
//           {isAuthenticated ? `Welcome, ${firstName}!` : "LOGIN"}
//         </button>

//         {/* Hamburger Icon */}
//         <button
//           className="lg:hidden text-[#00e5ff] text-2xl"
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           {isOpen ? "✖" : "☰"}
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       {isOpen && (
//         <div className="lg:hidden bg-[#0a0a1a]/95 flex flex-col items-center space-y-4 py-6 border-t border-[#1a1a3d] backdrop-blur-md animate-fadeIn">
//           {navItems.map((item) => (
//             <div
//               key={item.name}
//               onClick={() => handleNavigation(item.path)}
//               className="group relative cursor-pointer"
//             >
//               <h1 className="text-[#d9faff] font-bebas tracking-wider text-lg hover:text-[#00e5ff] transition-colors duration-300 group-hover:drop-shadow-[0_0_8px_#00e5ff]">
//                 {item.name}
//               </h1>
//               <span className="absolute left-0 bottom-[-3px] w-0 h-[2px] bg-gradient-to-r from-[#00e5ff] to-[#7f00ff] transition-all duration-300 group-hover:w-full"></span>
//             </div>
//           ))}

//           <button
//             onClick={() =>
//               navigate(isAuthenticated ? "/dashboard/profile" : "/login")
//             }
//             className="bg-gradient-to-r from-[#00e5ff] to-[#7f00ff] text-white font-bold px-6 py-2 rounded-md hover:shadow-[0_0_20px_#00e5ff] transition-all duration-300 font-bebas tracking-wider"
//           >
//             {isAuthenticated ? `Welcome, ${firstName}!` : "LOGIN"}
//           </button>
//         </div>
//       )}
//     </nav>
//   );
// }

// export default Navbar;

import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePortal } from "../../portal/context";
import { message } from "../../portal/api";
import clsx from "clsx";
import gsap from "gsap";
import { preloadPublicRoute } from "../publicRoutePreload";

// import Button from "../Button";
import { TiLocationArrow } from "react-icons/ti";

const navItems = [
  { name: "AVISHKAR", path: "/avishkar" },
  { name: "CULRAV", path: "/culrav" },
  { name: "GALLERY", path: "/gallery" },
  { name: "TEAM", path: "/team" },
  { name: "SPONSORS", path: "/sponsors" },
];

const NavBar = () => {
  const location = useLocation();

  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const { user, staff, loading: sessionLoading, logout } = usePortal();
  const isAuthenticated = !!user;
  const firstName = user?.name.split(" ")[0];
  const accountPath = staff
    ? staff.role === "admin"
      ? "/admin"
      : "/coordinator"
    : isAuthenticated
      ? "/portal"
      : "/login";
  const accountLabel = sessionLoading
    ? "ACCOUNT"
    : staff
    ? staff.role === "admin"
      ? "ADMIN"
      : "COORDINATOR"
    : isAuthenticated
      ? `Welcome, ${firstName}`
      : "LOGIN";
  async function signOutStaff() {
    setLogoutError("");
    try {
      await logout("staff");
      setIsMobileMenuOpen(false);
    } catch (error) {
      setLogoutError(message(error));
    }
  }

  const navContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      // The Team directory sidebar begins directly below the navigation bar.
      // Keep that boundary stable while its own page navigation is in use.
      if (location.pathname === "/team") {
        setIsNavVisible(true);
        navContainerRef.current?.classList.remove("floating-nav");
        lastScrollY.current = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;

      if (currentScrollY === 0) {
        setIsNavVisible(true);
        navContainerRef.current?.classList.remove("floating-nav");
      } else if (currentScrollY > lastScrollY.current) {
        setIsNavVisible(false);
        navContainerRef.current?.classList.add("floating-nav");
      } else if (currentScrollY < lastScrollY.current) {
        setIsNavVisible(true);
        navContainerRef.current?.classList.add("floating-nav");
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/team") {
      setIsNavVisible(true);
      navContainerRef.current?.classList.remove("floating-nav");
    }
  }, [location.pathname]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <div
        ref={navContainerRef}
        className="festival-navbar fixed inset-x-0 top-0 z-50 h-16 border-x-0 border-t-0 border-b transition-all duration-300"
        style={{
          backgroundColor: "rgba(254, 249, 195, 0.18)",
          borderBottomColor: "rgba(234, 179, 8, 0.2)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <header className="absolute top-1/2 w-full -translate-y-1/2">
          <nav className="flex size-full items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
            {/* Logo and Product button */}
            <div className="flex items-center gap-7">
              <Link to="/" className="flex items-center" onPointerEnter={() => preloadPublicRoute("/")} onFocus={() => preloadPublicRoute("/")}>
                <img
                  src="/media/common/branding/logo_avishkar_culrav.png"
                  alt="logo"
                  className="h-10 sm:h-11 w-auto object-contain"
                />
              </Link>

              {/* <Button
                id="product-button"
                title="Products"
                rightIcon={<TiLocationArrow />}
                containerClass="bg-blue-50 md:flex hidden items-center justify-center gap-1"
              /> */}
            </div>

            {/* Desktop Navigation Links and Audio Button */}
            <div className="flex h-full items-center">
              <div className="hidden md:block">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onPointerEnter={() => preloadPublicRoute(item.path)}
                    onFocus={() => preloadPublicRoute(item.path)}
                    onTouchStart={() => preloadPublicRoute(item.path)}
                    onClick={(e) => {
                      if (location.pathname === item.path) {
                        e.preventDefault();
                      }
                    }}
                    className={clsx("nav-hover-btn", {
                      "text-[#321A0A]": location.pathname === item.path,
                    })}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  to={accountPath}
                  aria-busy={sessionLoading}
                  onClick={(event) => {
                    if (sessionLoading || location.pathname === accountPath) {
                      event.preventDefault();
                    }
                  }}
                  className={clsx("nav-hover-btn", {
                    "text-[#321A0A]": location.pathname === accountPath,
                  })}
                >
                  {accountLabel}
                </Link>
                {staff && (
                  <button className="nav-hover-btn" onClick={signOutStaff}>
                    SIGN OUT
                  </button>
                )}
              </div>

              {/* Audio Indicator Button */}
              {/* <button
                onClick={toggleAudioIndicator}
                className="ml-10 flex items-center space-x-0.5"
                aria-label="Toggle audio"
              >
                <audio
                  ref={audioElementRef}
                  className="hidden"
                  src="/audio/loop.mp3"
                  loop
                />
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={clsx("indicator-line", {
                      active: isIndicatorActive,
                    })}
                    style={{
                      animationDelay: `${bar * 0.1}s`,
                    }}
                  />
                ))}
              </button> */}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="ml-4 md:hidden flex flex-col gap-1.5 p-2"
                aria-label="Toggle mobile menu"
              >
                <span
                  className={clsx(
                    "w-6 h-0.5 bg-[#321A0A] transition-all duration-300",
                    {
                      "rotate-45 translate-y-2": isMobileMenuOpen,
                    },
                  )}
                />
                <span
                  className={clsx(
                    "w-6 h-0.5 bg-[#321A0A] transition-all duration-300",
                    {
                      "opacity-0": isMobileMenuOpen,
                    },
                  )}
                />
                <span
                  className={clsx(
                    "w-6 h-0.5 bg-[#321A0A] transition-all duration-300",
                    {
                      "-rotate-45 -translate-y-2": isMobileMenuOpen,
                    },
                  )}
                />
              </button>
            </div>
          </nav>
        </header>
      </div>
      {logoutError && (
        <p className="fixed top-20 right-6 z-50 ca-error" role="alert">
          {logoutError}
        </p>
      )}

      {/* Mobile Menu Overlay */}
      <div
        className={clsx(
          "fixed inset-0 z-40 md:hidden transition-all duration-300",
          {
            "opacity-100 pointer-events-auto": isMobileMenuOpen,
            "opacity-0 pointer-events-none": !isMobileMenuOpen,
          },
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Content */}
        <div
          className={clsx(
            "absolute top-20 right-4 left-4 bg-black/95 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl transform transition-all duration-300",
            {
              "translate-y-0 opacity-100": isMobileMenuOpen,
              "-translate-y-4 opacity-0": !isMobileMenuOpen,
            },
          )}
        >
          <div className="flex flex-col gap-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onTouchStart={() => preloadPublicRoute(item.path)}
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  if (location.pathname === item.path) {
                    e.preventDefault();
                  }
                }}
                className={clsx(
                  "px-4 py-3 font-general text-base font-bold tracking-[0.12em] rounded-lg transition-all duration-300",
                  {
                    "text-blue-400 bg-blue-500/10":
                      location.pathname === item.path,
                    "text-white hover:text-blue-300 hover:bg-white/5":
                      location.pathname !== item.path,
                  },
                )}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to={accountPath}
              aria-busy={sessionLoading}
              onClick={(event) => {
                setIsMobileMenuOpen(false);
                if (sessionLoading || location.pathname === accountPath) {
                  event.preventDefault();
                }
              }}
              className={clsx(
                "px-4 py-3 font-general text-base font-bold tracking-[0.12em] rounded-lg transition-all duration-300",
                {
                  "text-blue-400 bg-blue-500/10":
                    location.pathname === accountPath,
                  "text-white hover:text-blue-300 hover:bg-white/5":
                    location.pathname !== accountPath,
                },
              )}
            >
              {accountLabel}
            </Link>
            {staff && (
              <button
                className="px-4 py-3 text-left font-general text-base font-bold tracking-[0.12em] text-white rounded-lg hover:text-blue-300 hover:bg-white/5"
                onClick={signOutStaff}
              >
                SIGN OUT
              </button>
            )}
          </div>

          {/* <div className="mt-4 pt-4 border-t border-white/10">
            <Button
              id="mobile-product-button"
              title="Products"
              rightIcon={<TiLocationArrow />}
              containerClass="bg-blue-600 text-white w-full flex items-center justify-center gap-2 hover:bg-blue-700"
            />
          </div> */}
        </div>
      </div>
    </>
  );
};

export default NavBar;
