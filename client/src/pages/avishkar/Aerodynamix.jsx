import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/aerodynamix/subevents.json";

export default function AerodynamixPage() {
  return <EventExplorePage data={data} festival="avishkar" category="aerodynamix" />;
}
