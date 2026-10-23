import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/gnosomania/subevents.json";

export default function GnosomaniaPage() {
  return <EventExplorePage data={data} festival="avishkar" category="gnosomania" />;
}
