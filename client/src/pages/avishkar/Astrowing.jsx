import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/astrowing/subevents.json";

export default function AstrowingPage() {
  return <EventExplorePage data={data} festival="avishkar" category="astrowing" />;
}
