import { warmImages } from "./useImagePreloader";
import { mobileRouteCriticalImages, routeCriticalImages } from "./routeCriticalImages";

// These match the React.lazy import paths, so navigation reuses the same chunk.
const routeModules = {
  "/": () => import("../pages/Homepage"),
  "/culrav": () => import("../pages/culravEvent"),
  "/avishkar": () => import("../pages/AvishkarAllEvent"),
  "/gallery": () => import("../pages/Gallery.jsx"),
  "/team": () => import("../pages/TeamPage"),
  "/culrav/anunaad": () => import("../pages/culrav/Anunaad"),
  "/culrav/darkroom": () => import("../pages/culrav/Darkroom"),
  "/culrav/rangmanch": () => import("../pages/culrav/Rangmanch"),
  "/culrav/litmuse": () => import("../pages/culrav/Litmuse"),
  "/culrav/rangsazzi": () => import("../pages/culrav/Rangsazzi"),
  "/culrav/spandan": () => import("../pages/culrav/Spandan"),
  "/culrav/razzmatazz": () => import("../pages/culrav/Razzmatazz"),
  "/avishkar/cyberquest": () => import("../pages/avishkar/CyberQuest"),
  "/avishkar/genesis": () => import("../pages/avishkar/Genesis"),
  "/avishkar/electromania": () => import("../pages/avishkar/Electromania"),
  "/avishkar/gnosomania": () => import("../pages/avishkar/Gnosomania"),
  "/avishkar/kreedomania": () => import("../pages/avishkar/Kreedomania"),
  "/avishkar/mechrocosm": () => import("../pages/avishkar/Mechrocosm"),
  "/avishkar/monopoly": () => import("../pages/avishkar/Monopoly"),
  "/avishkar/nirmaan": () => import("../pages/avishkar/Nirmaan"),
  "/avishkar/oligopoly": () => import("../pages/avishkar/Oligopoly"),
  "/avishkar/powersurge": () => import("../pages/avishkar/PowerSurge"),
  "/avishkar/rasayans": () => import("../pages/avishkar/Rasayans"),
  "/avishkar/aerodynamix": () => import("../pages/avishkar/Aerodynamix"),
  "/avishkar/astrowing": () => import("../pages/avishkar/Astrowing"),
  "/avishkar/robomania": () => import("../pages/avishkar/Robomania"),
};

const moduleRequests = new Map();

export function preloadPublicRoute(path, { images = true } = {}) {
  const load = routeModules[path];
  if (!load) return Promise.resolve();

  if (!moduleRequests.has(path)) {
    const request = load().catch(() => {
      moduleRequests.delete(path);
      return null;
    });
    moduleRequests.set(path, request);
  }

  return moduleRequests.get(path).then((module) => {
    const useMobileImages = window.matchMedia?.("(max-width: 639px)").matches;
    const criticalImages = useMobileImages
      ? mobileRouteCriticalImages[path] || routeCriticalImages[path]
      : routeCriticalImages[path];
    if (images && module && criticalImages) {
      return warmImages(criticalImages);
    }
  });
}
