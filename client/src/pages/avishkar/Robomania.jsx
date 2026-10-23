import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/robomania/subevents.json";

export default function RobomaniaPage() {
  return <EventExplorePage data={data} festival="avishkar" category="robomania" />;
}
