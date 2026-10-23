import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/monopoly/subevents.json";

export default function MonopolyPage() {
  return <EventExplorePage data={data} festival="avishkar" category="monopoly" />;
}
