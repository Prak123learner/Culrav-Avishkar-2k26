import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/mechaverse/subevents.json";

export default function MechaversePage() {
  return <EventExplorePage data={data} festival="avishkar" category="mechaverse" />;
}
