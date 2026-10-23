import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { DataLoadingPage, PortalLoading } from "./PortalLoading";
import { usePortal } from "./context";
import { useResource } from "./useResource";
import { RegistrationPage } from "./ParticipantPages";

export function eventRegistrationPath(festival, category, title) {
  return `/register/${festival}/${category}/${encodeURIComponent(title)}`;
}

export function EventRegistrationLink({ festival, category, title }) {
  const navigate = useNavigate();
  const isCulrav = festival === "culrav";
  return (
    <button
      type="button"
      onClick={() => navigate(eventRegistrationPath(festival, category, title))}
      className={`
        fixed bottom-6 right-6 md:bottom-8 md:right-8
        z-50 group border-2
        ${
          isCulrav
            ? "border-[#dfa255] bg-gradient-to-r from-[#992510] via-[#b33118] to-[#801c0a] hover:from-[#ab2d14] hover:to-[#992510] shadow-[0_8px_30px_rgba(153,37,16,0.65),inset_0_1px_2px_rgba(255,245,215,0.5)]"
            : "border-[#96547f] bg-gradient-to-r from-[#471E39] via-[#5d274c] to-[#36152a] hover:from-[#5c274b] hover:to-[#471E39] shadow-[0_8px_30px_rgba(71,30,57,0.65),inset_0_1px_2px_rgba(245,215,235,0.5)]"
        }
        text-[#fffef8] font-cinzel font-black uppercase tracking-[0.22em]
        px-6 py-3 md:px-8 md:py-3.5 text-xs sm:text-sm md:text-base
        hover:border-[#ffd977] hover:scale-105
        active:scale-95 active:translate-y-[1px]
        transition-all duration-200 ease-out
        select-none cursor-pointer
      `}
    >
      <span className="pointer-events-none absolute inset-1 border border-[#ffd977]/30" />
      <span className="relative z-30 flex items-center gap-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
        <span>Register Now</span>
        <span className="transition-transform duration-200 group-hover:translate-x-1.5 text-sm md:text-base">
          ➔
        </span>
      </span>
    </button>
  );
}

export function ResolveEventRegistration() {
  const { user, loading } = usePortal();
  const location = useLocation();
  if (loading)
    return <PortalLoading label="Opening your participant archive" />;
  if (!user) {
    return (
      <Navigate
        replace
        to="/login"
        state={{
          returnTo: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }
  return <ResolvedEventRegistration />;
}

function ResolvedEventRegistration() {
  const { festival, category, title } = useParams();
  const query = new URLSearchParams({ festival, category, title }).toString();
  const resource = useResource(`/registration-context?${query}`);
  if (resource.loading) {
    return (
      <DataLoadingPage
        label="Preparing your registration"
        festival={festival}
      />
    );
  }
  if (resource.error) {
    return (
      <main
        className="ca-portal ca-registration flex flex-col items-center justify-center min-h-screen text-center px-4"
        data-festival={festival}
      >
        <div className="ca-card max-w-md w-full relative z-10">
          <p role="alert" className="ca-error">
            {resource.error}
          </p>
          <button
            type="button"
            onClick={resource.reload}
            className="mt-4"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }
  const event = resource.data?.event;
  return event ? (
    <RegistrationPage
      eventData={event}
      registrationData={resource.data.registration}
      teamsData={resource.data.teams}
    />
  ) : (
    <Navigate replace to="/coming-soon" />
  );
}
