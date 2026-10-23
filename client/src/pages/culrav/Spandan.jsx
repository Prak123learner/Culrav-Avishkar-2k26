import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/culrav/spandan/subevents.json";

export default function SpandanPage() {
  return <EventExplorePage data={data} festival="culrav" category="spandan" />;
}
