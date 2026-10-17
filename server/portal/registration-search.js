function normalized(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function registrationSearchKeys({ teamName, participants = [] }) {
  const keys = new Set();
  const add = (value) => {
    const whole = normalized(value);
    if (!whole) return;
    keys.add(whole);
    for (const word of whole.split(/[^a-z0-9]+/)) if (word) keys.add(word);
  };
  add(teamName);
  for (const participant of participants) {
    add(participant?.name);
    const caId = normalized(participant?.caId);
    if (!caId) continue;
    keys.add(caId);
    const suffix = caId.match(/(\d{6})$/)?.[1];
    if (suffix) keys.add(suffix);
  }
  return [...keys];
}

function searchPrefix(value) {
  return normalized(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { registrationSearchKeys, searchPrefix };
