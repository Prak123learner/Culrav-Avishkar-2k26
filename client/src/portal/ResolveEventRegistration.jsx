import { Navigate, useLocation, useParams } from "react-router-dom";
import { DataLoadingPage, PortalLoading } from "./PortalLoading";
import { usePortal } from "./context";
import { useResource } from "./useResource";
import { RegistrationPage } from "./ParticipantPages";

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
        state={{ returnTo: `${location.pathname}${location.search}${location.hash}` }}
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
    return <DataLoadingPage label="Preparing your registration" festival={festival} />;
  }
  if (resource.error) {
    return (
      <main
        className="ca-portal ca-registration flex flex-col items-center justify-center min-h-screen text-center px-4"
        data-festival={festival}
      >
        <div className="ca-card max-w-md w-full relative z-10">
          <p role="alert" className="ca-error">{resource.error}</p>
          <button type="button" onClick={resource.reload} className="mt-4">
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
