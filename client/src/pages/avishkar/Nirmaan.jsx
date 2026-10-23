import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/nirmaan/subevents.json";

export default function NirmaanPage() {
  return <EventExplorePage data={data} festival="avishkar" category="nirmaan" />;
}
