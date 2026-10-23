import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Loader, { RouteLoader } from "./components/Loader";
import ScrollToTop from "./components/ScrollToTop";
import { TeamPage } from "./pages/TeamPage";
import Gallery from "./pages/Gallery.jsx";
import { Toaster } from "sonner";
import Navbar from "./components/General/Navbar";

import { GoogleLogin, StaffLogin } from "./portal/AuthPages";
import { ParticipantHome, RegistrationPage } from "./portal/ParticipantPages";
import { CoordinatorHome } from "./portal/StaffPages";
import { ResolveEventRegistration } from "./portal/EventRegistrationLink";
import { PortalProvider } from "./portal/session";

// lazy loaded pages
const Homepage = lazy(() => import("./pages/Homepage"));
const CulravEvent = lazy(() => import("./pages/culravEvent"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ComingSoonPage = lazy(() => import("./pages/ComingSoonPage.jsx"));

const Sponsers = lazy(() => import("./pages/Sponsers/Sponser_2.jsx"));
const AvishkarEvents = lazy(() => import("./pages/AvishkarAllEvent"));

// Culrav sub-event pages
const Anunaad = lazy(() => import("./pages/culrav/Anunaad"));
const Darkroom = lazy(() => import("./pages/culrav/Darkroom"));
const Rangmanch = lazy(() => import("./pages/culrav/Rangmanch"));
const Litmuse = lazy(() => import("./pages/culrav/Litmuse"));
const Rangsazzi = lazy(() => import("./pages/culrav/Rangsazzi"));
const Spandan = lazy(() => import("./pages/culrav/Spandan"));
const Razzmatazz = lazy(() => import("./pages/culrav/Razzmatazz"));

// New event main pages — updated exact paths
const CyberQuestPage = lazy(() => import("./pages/avishkar/CyberQuest"));
const GenesisPage = lazy(() => import("./pages/avishkar/Genesis"));
const ElectromaniaPage = lazy(() => import("./pages/avishkar/Electromania"));
const GnosomaniaPage = lazy(() => import("./pages/avishkar/Gnosomania"));
const KreedomaniaPage = lazy(() => import("./pages/avishkar/Kreedomania"));
const MechrocosmPage = lazy(() => import("./pages/avishkar/Mechrocosm"));
const MonopolyPage = lazy(() => import("./pages/avishkar/Monopoly"));
const NirmaanPage = lazy(() => import("./pages/avishkar/Nirmaan"));
const OligopolyPage = lazy(() => import("./pages/avishkar/Oligopoly"));
const PowerSurgePage = lazy(() => import("./pages/avishkar/PowerSurge"));
const RasayansPage = lazy(() => import("./pages/avishkar/Rasayans"));
const AerodynamixPage = lazy(() => import("./pages/avishkar/Aerodynamix"));
const AstrowingPage = lazy(() => import("./pages/avishkar/Astrowing"));
const RobomaniaPage = lazy(() => import("./pages/avishkar/Robomania"));

function RoutePageTransition({ children }) {
  const location = useLocation();

  return (
    <div className="route-page-transition" key={location.pathname}>
      {children}
    </div>
  );
}

function App() {
  const [showInitialReveal, setShowInitialReveal] = useState(true);
  const finishInitialReveal = useCallback(() => {
    setShowInitialReveal(false);
  }, []);

  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  return (
    <>
      {showInitialReveal && <Loader onComplete={finishInitialReveal} />}
      <BrowserRouter>
        <ScrollToTop />
        <PortalProvider>
          <Navbar />
          <Suspense fallback={<RouteLoader />}>
            <RoutePageTransition>
              <Routes>
              <Route index element={<Homepage />} />

              {/* Culrav main and sub-events */}
              <Route path="/culrav" element={<CulravEvent />} />
              <Route path="/culrav/anunaad" element={<Anunaad />} />
              <Route path="/culrav/darkroom" element={<Darkroom />} />
              <Route path="/culrav/rangmanch" element={<Rangmanch />} />
              <Route path="/culrav/litmuse" element={<Litmuse />} />
              <Route path="/culrav/rangsazzi" element={<Rangsazzi />} />
              <Route path="/culrav/spandan" element={<Spandan />} />
              <Route path="/culrav/razzmatazz" element={<Razzmatazz />} />

              {/* Avishkar main and sub-events */}
              <Route path="/avishkar/cyberquest" element={<CyberQuestPage />} />
              <Route path="/avishkar/genesis" element={<GenesisPage />} />
              <Route
                path="/avishkar/electromania"
                element={<ElectromaniaPage />}
              />
              <Route
                path="/avishkar/kreedomania"
                element={<KreedomaniaPage />}
              />
              <Route path="/avishkar/mechrocosm" element={<MechrocosmPage />} />
              <Route path="/avishkar/monopoly" element={<MonopolyPage />} />
              <Route path="/avishkar/nirmaan" element={<NirmaanPage />} />
              <Route path="/avishkar/oligopoly" element={<OligopolyPage />} />
              <Route path="/avishkar/powersurge" element={<PowerSurgePage />} />
              <Route path="/avishkar/rasayans" element={<RasayansPage />} />
              <Route
                path="/avishkar/aerodynamix"
                element={<AerodynamixPage />}
              />
              <Route path="/avishkar/astrowing" element={<AstrowingPage />} />
              <Route path="/avishkar/robomania" element={<RobomaniaPage />} />
              <Route path="/avishkar/gnosomania" element={<GnosomaniaPage />} />

              {/* Team Page */}
              <Route path="/team" element={<TeamPage />} />
              <Route path="/gallery" element={<Gallery />} />

              <Route path="/sponsors" element={<Sponsers />} />
              <Route path="/avishkar" element={<AvishkarEvents />} />
              <Route path="/coming-soon" element={<ComingSoonPage />} />
              <Route path="/login" element={<GoogleLogin />} />
              <Route path="/portal" element={<ParticipantHome />} />
              <Route path="/portal/events/:id" element={<RegistrationPage />} />
              <Route
                path="/register/:festival/:category/:title"
                element={<ResolveEventRegistration />}
              />
              <Route path="/coordinator/login" element={<StaffLogin />} />
              <Route path="/coordinator" element={<CoordinatorHome />} />
              <Route path="/admin" element={<CoordinatorHome adminOnly />} />
              <Route path="/admin/login" element={<StaffLogin adminLogin />} />
              {/* FALLBACK PAGE */}
              <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </RoutePageTransition>
          </Suspense>
        </PortalProvider>
      </BrowserRouter>
      {/* Global Toaster */}
      <Toaster richColors position="bottom-right" />
    </>
  );
}

export default App;
