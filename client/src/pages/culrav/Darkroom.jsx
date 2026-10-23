import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/culrav/darkroom/subevents.json";

export default function DarkroomPage() {
  return <EventExplorePage data={data} festival="culrav" category="darkroom" />;
}
