import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/electromania/subevents.json";

export default function ElectromaniaPage() {
  return <EventExplorePage data={data} festival="avishkar" category="electromania" />;
}
