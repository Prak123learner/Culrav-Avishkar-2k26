import { Navigate, useNavigate, useParams } from "react-router-dom";
import { DataLoadingPage } from "./PortalLoading";
import { useResource } from "./useResource";
import { RegistrationPage } from "./ParticipantPages";

export function eventRegistrationPath(festival, category, title) {
  return `/register/${festival}/${category}/${encodeURIComponent(title)}`;
}

export function EventRegistrationLink({ festival, category, title }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(eventRegistrationPath(festival, category, title))}
      className="
    relative
    block mx-auto mt-8
    px-3 py-2 text-sm

    md:fixed md:bottom-8 md:right-8 md:mx-0 md:mt-0
    md:px-8 md:py-3 md:text-lg

    lg:px-10 lg:py-4 lg:text-xl
    z-50 group bg-black border-[3px] border-cyan-400 text-white
    font-bold uppercase tracking-[0.15em]
    shadow-[4px_4px_0_#d946ef,-3px_-3px_0_#06b6d4]
    hover:shadow-[-6px_-6px_0_#d946ef,6px_6px_0_#06b6d4]
    hover:border-fuchsia-500 hover:text-cyan-300
    transition-all duration-150 ease-linear
    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
    select-none overflow-hidden
  "
    >
      {/* scanline overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.7)_50%)] bg-[length:100%_4px] pointer-events-none z-20 opacity-60"></div>

      <span className="relative z-30 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
        Register Now
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className="
        w-4 h-4
        md:w-6 md:h-6
        text-fuchsia-500
        group-hover:text-cyan-400
        group-hover:translate-x-2
        transition-all duration-150
      "
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>
      </span>

      <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[25deg] group-hover:animate-[ping_0.3s_linear_1] opacity-0"></div>
    </button>
  );
}

export function ResolveEventRegistration() {
  const { festival, category, title } = useParams();
  const query = new URLSearchParams({ festival, category, title }).toString();
  const resource = useResource(`/events/resolve?${query}`);
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
      <main className="ca-portal">
        <p role="alert" className="ca-error">
          {resource.error}
        </p>
        <button onClick={resource.reload}>Try again</button>
      </main>
    );
  }
  const event = resource.data?.event;
  return event ? (
    <RegistrationPage eventData={event} />
  ) : (
    <Navigate replace to="/coming-soon" />
  );
}
