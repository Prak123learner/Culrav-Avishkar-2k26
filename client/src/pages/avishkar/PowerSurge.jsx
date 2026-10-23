import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/powersurge/subevents.json";

export default function PowerSurgePage() {
  return <EventExplorePage data={data} festival="avishkar" category="powersurge" />;
}
