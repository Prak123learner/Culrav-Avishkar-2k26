import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/rasayans/subevents.json";

export default function RasayansPage() {
  return <EventExplorePage data={data} festival="avishkar" category="rasayans" />;
}
