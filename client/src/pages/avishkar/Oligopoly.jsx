import EventExplorePage from "../../components/General/EventExplorePage";
import data from "../../data/event-catalog/avishkar/oligopoly/subevents.json";

export default function OligopolyPage() {
  return <EventExplorePage data={data} festival="avishkar" category="oligopoly" />;
}
