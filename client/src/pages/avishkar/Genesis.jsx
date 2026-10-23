import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/genesis/subevents.json";

export default function GenesisPage() {
  return <EventExplorePage data={data} festival="avishkar" category="genesis" />;
}
