import { useEffect, useState } from "react";
import { portalApi } from "./api";

export function rulePoints(rules = "") {
  return rules
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^\s*(?:[•●*-]\s+|\d+[.)]\s+)/, "")
        .replace(/\u2028/g, "\n")
        .trim(),
    )
    .filter(Boolean);
}

export function serializeRulePoints(points) {
  return points
    .filter((point) => point.trim())
    .map((point) => point.replace(/\r?\n/g, "\u2028"))
    .join("\n");
}

export function eventCoordinators(event) {
  if (Array.isArray(event.coordinators)) return event.coordinators;
  return (event.contact || "")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.*?)\s+[—–-]\s+(.*)$/);
      return match
        ? { name: match[1], phone: match[2] }
        : { name: line, phone: "" };
    });
}

export function usePublicEventContent(festival, category, original) {
  const [loaded, setLoaded] = useState(null);
  const title = original?.eventName || original?.name;
  useEffect(() => {
    if (!title) return;
    const controller = new AbortController();
    portalApi
      .get("/event-content", {
        params: { festival, category, title },
        signal: controller.signal,
      })
      .then(({ data }) => {
        if (!controller.signal.aborted)
          setLoaded({ original, event: data.event });
      })
      .catch(() => {
        // Keep the original published catalog available if the API is offline.
      });
    return () => controller.abort();
  }, [festival, category, title, original]);
  if (!original || loaded?.original !== original) return original;
  const event = loaded.event;
  const contacts = eventCoordinators(event);
  return {
    ...original,
    description: event.description,
    desc: (event.description || "").split(/\n\s*\n/).filter(Boolean),
    rules: rulePoints(event.rules),
    coords: contacts,
    coordinators: contacts.map((person) => ({
      ...person,
      contact: person.phone,
    })),
  };
}
