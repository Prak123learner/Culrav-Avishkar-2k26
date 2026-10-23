import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/cyberquest/subevents.json";

export default function CyberQuestPage() {
  return <EventExplorePage data={data} festival="avishkar" category="cyberquest" />;
}
