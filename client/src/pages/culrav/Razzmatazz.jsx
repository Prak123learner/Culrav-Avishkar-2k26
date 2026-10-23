import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/culrav/razzmatazz/subevents.json";

export default function RazzmatazzPage() {
  return <EventExplorePage data={data} festival="culrav" category="razzmatazz" />;
}
