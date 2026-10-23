import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/culrav/rangsazzi/subevents.json";

export default function RangsazziPage() {
  return <EventExplorePage data={data} festival="culrav" category="rangsazzi" />;
}
