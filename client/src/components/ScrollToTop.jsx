import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Disable browser's default scroll restoration behavior
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // Immediately scroll to the top of the page on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Run again in the next animation frame for lazy-loaded route transitions
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, hash]);

  return null;
}
