import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/kreedomania/subevents.json";

export default function KreedomaniaPage() {
  return <EventExplorePage data={data} festival="avishkar" category="kreedomania" />;
}
