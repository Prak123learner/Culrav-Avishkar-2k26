export function eventRegistrationPath(festival, category, title) {
  return `/register/${festival}/${category}/${encodeURIComponent(title)}`;
}
