import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/cosmocon/subevents.json";

export default function CosmoconPage() {
  return <EventExplorePage data={data} festival="avishkar" category="cosmocon" />;
}
