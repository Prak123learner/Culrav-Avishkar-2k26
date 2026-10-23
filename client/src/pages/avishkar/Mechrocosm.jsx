import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/mechrocosm/subevents.json";

export default function MechrocosmPage() {
  return <EventExplorePage data={data} festival="avishkar" category="mechrocosm" />;
}
