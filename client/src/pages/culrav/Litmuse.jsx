import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/culrav/litmuse/subevents.json";

export default function LitmusePage() {
  return <EventExplorePage data={data} festival="culrav" category="litmuse" />;
}
