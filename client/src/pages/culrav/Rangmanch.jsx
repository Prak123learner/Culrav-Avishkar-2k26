import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/culrav/rangmanch/subevents.json";

export default function RangmanchPage() {
  return <EventExplorePage data={data} festival="culrav" category="rangmanch" />;
}
