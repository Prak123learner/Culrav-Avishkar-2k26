import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/culrav/anunaad/subevents.json";

export default function AnunaadPage() {
  return <EventExplorePage data={data} festival="culrav" category="anunaad" />;
}
