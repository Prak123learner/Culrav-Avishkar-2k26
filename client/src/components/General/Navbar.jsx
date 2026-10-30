import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePortal } from "../../portal/context";
import { message } from "../../portal/api";
import clsx from "clsx";
import gsap from "gsap";
import { preloadPublicRoute } from "../publicRoutePreload";
import { Home } from "lucide-react";

// import Button from "../Button";
import { TiLocationArrow } from "react-icons/ti";

const navItems = [
  { name: "HOME", path: "/" },
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
      ? "PROFILE"
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
  const isTeamPage = location.pathname.replace(/\/+$/, "").toLowerCase() === "/team";

  useEffect(() => {
    // The Team page requires the navbar to remain fixed and stable at all times
    // so both the desktop directory and mobile dropdown remain aligned.
    if (isTeamPage) {
      setIsNavVisible(true);
      navContainerRef.current?.classList.remove("floating-nav");
      if (navContainerRef.current) {
        gsap.killTweensOf(navContainerRef.current);
        gsap.set(navContainerRef.current, { y: 0, opacity: 1, clearProps: "transform,opacity" });
      }
      return;
    }

    const handleScroll = () => {
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
  }, [location.pathname, isTeamPage]);

  useEffect(() => {
    if (isTeamPage) {
      setIsNavVisible(true);
      navContainerRef.current?.classList.remove("floating-nav");
      if (navContainerRef.current) {
        gsap.killTweensOf(navContainerRef.current);
        gsap.set(navContainerRef.current, { y: 0, opacity: 1, clearProps: "transform,opacity" });
      }
      return;
    }

    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible, isTeamPage]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <div
        ref={navContainerRef}
        className="festival-navbar fixed inset-x-0 top-0 z-[90] h-16 border-x-0 border-t-0 border-b transition-colors duration-300"
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
                  src="/media/common/branding/Culrav-Avishkar-2026logo.png"
                  alt="Culrav Avishkar 2026"
                  className="h-10 sm:h-11 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links and Mobile Hamburger */}
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
                      "nav-item-active": location.pathname === item.path,
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
                    "nav-item-active": location.pathname === accountPath,
                  })}
                >
                  {accountLabel}
                </Link>
                {staff && (
                  <button className="nav-hover-btn cursor-pointer" onClick={signOutStaff}>
                    SIGN OUT
                  </button>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-menu-toggle md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
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
          "fixed inset-0 z-[80] md:hidden transition-all duration-300",
          {
            "opacity-100 pointer-events-auto": isMobileMenuOpen,
            "opacity-0 pointer-events-none": !isMobileMenuOpen,
          },
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#1d0d03]/55 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Content */}
        <div
          className={clsx(
            "absolute top-20 right-4 left-4 overflow-hidden rounded-2xl border border-[#9b602e]/70 bg-gradient-to-br from-[#fff3d8]/[0.98] via-[#edd09a]/[0.98] to-[#cf9655]/[0.98] p-6 shadow-[0_24px_60px_rgba(45,20,6,0.42)] backdrop-blur-md transform transition-all duration-300",
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
                  "px-4 py-3 font-general text-base font-bold tracking-[0.12em] rounded-lg transition-all duration-300 flex items-center gap-2.5",
                  {
                    "text-[#642f10] bg-[#b56d2e]/20 border border-[#9b602e]/45":
                      location.pathname === item.path,
                    "text-[#42230f] hover:text-[#6c3210] hover:bg-[#fff4d7]/50":
                      location.pathname !== item.path,
                  },
                )}
              >
                {item.name === "HOME" && <Home className="w-4 h-4 shrink-0 text-[#8c4f1d]" />}
                <span>{item.name}</span>
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
                  "text-[#642f10] bg-[#b56d2e]/20 border border-[#9b602e]/45":
                    location.pathname === accountPath,
                  "text-[#42230f] hover:text-[#6c3210] hover:bg-[#fff4d7]/50":
                    location.pathname !== accountPath,
                },
              )}
            >
              {accountLabel}
            </Link>
            {staff && (
              <button
                className="px-4 py-3 text-left font-general text-base font-bold tracking-[0.12em] text-[#42230f] rounded-lg hover:text-[#6c3210] hover:bg-[#fff4d7]/50 cursor-pointer"
                onClick={signOutStaff}
              >
                SIGN OUT
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
