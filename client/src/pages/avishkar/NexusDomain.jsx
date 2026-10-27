import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/nexus-domain/subevents.json";

export default function NexusDomainPage() {
  return (
    <EventExplorePage
      data={data}
      festival="avishkar"
      category="nexus-domain"
    />
  );
}
