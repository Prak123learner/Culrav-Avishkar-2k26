import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/aeroverse/subevents.json";

export default function AeroversePage() {
  return <EventExplorePage data={data} festival="avishkar" category="aeroverse" />;
}
