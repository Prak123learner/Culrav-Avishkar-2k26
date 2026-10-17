const AppError = require("../utils/appError");
function check(condition, message, code = 400) {
  if (!condition) throw new AppError(message, code);
}
function text(value, max = 200, required = false) {
  check(typeof value === "string" || value === undefined, "Expected text");
  const result = (value || "").trim();
  check(
    result.length <= max && (!required || result.length > 0),
    `Text must be ${required ? "1" : "0"}–${max} characters`,
  );
  return result;
}
function link(value) {
  try {
    const u = new URL(value);
    return (
      ["https:", "http:"].includes(u.protocol) && !u.username && !u.password
    );
  } catch {
    return false;
  }
}
function fields(input) {
  check(Array.isArray(input) && input.length <= 50, "Use up to 50 questions");
  const ids = new Set();
  return input.map((f) => {
    const id = text(f.id, 80, true);
    check(
      /^[a-zA-Z0-9_-]+$/.test(id) &&
        !["__proto__", "constructor", "prototype"].includes(id) &&
        !ids.has(id),
      "Question IDs must be unique",
    );
    ids.add(id);
    check(
      [
        "text",
        "paragraph",
        "number",
        "date",
        "select",
        "radio",
        "checkbox",
        "link",
      ].includes(f.type),
      "Unsupported field type",
    );
    const options = ["select", "radio", "checkbox"].includes(f.type)
      ? f.options
      : [];
    check(
      Array.isArray(options) && options.length <= 100,
      "Use up to 100 choices",
    );
    const clean = options.map((o) => text(o, 200)).filter(Boolean);
    if (["select", "radio", "checkbox"].includes(f.type))
      check(
        clean.length > 0 && new Set(clean).size === clean.length,
        "Choices must be nonempty and unique",
      );
    return {
      id,
      label: text(f.label, 200, true),
      type: f.type,
      required: !!f.required,
      help: text(f.help, 1000),
      options: clean,
    };
  });
}
function answers(definition, input) {
  check(
    input && typeof input === "object" && !Array.isArray(input),
    "Answers must be an object",
  );
  const result = {};
  check(
    Object.keys(input).every((k) => definition.some((f) => f.id === k)),
    "Unknown question in answers",
  );
  for (const f of definition) {
    const v = input[f.id];
    const empty =
      v === undefined ||
      v === null ||
      v === "" ||
      (Array.isArray(v) && !v.length);
    check(!f.required || !empty, `${f.label} is required`);
    if (empty) continue;
    if (f.type === "checkbox") {
      check(
        Array.isArray(v) &&
          new Set(v).size === v.length &&
          v.every((x) => f.options.includes(x)),
        `Invalid choices for ${f.label}`,
      );
      result[f.id] = v;
    } else if (f.type === "number") {
      check(
        (typeof v === "number" || typeof v === "string") &&
          String(v).trim() !== "" &&
          Number.isFinite(Number(v)),
        `Invalid number for ${f.label}`,
      );
      result[f.id] = Number(v);
    } else {
      const s = text(v, f.type === "paragraph" ? 10000 : 2000, true);
      if (["select", "radio"].includes(f.type))
        check(f.options.includes(s), `Invalid choice for ${f.label}`);
      if (f.type === "link")
        check(link(s), `Use a valid http(s) file/folder link for ${f.label}`);
      if (f.type === "date")
        check(
          /^\d{4}-\d{2}-\d{2}$/.test(s) &&
            Number.isFinite(+new Date(s)) &&
            new Date(s).toISOString().slice(0, 10) === s,
          `Invalid date for ${f.label}`,
        );
      result[f.id] = s;
    }
  }
  return result;
}
function profileComplete(p) {
  const years = { "B.Tech": 4, MBA: 2, MCA: 3 };
  return !!(
    p.college &&
    p.registrationNumber &&
    p.course &&
    Number.isInteger(p.year) &&
    p.year >= 1 &&
    p.year <= years[p.course] &&
    p.branch &&
    p.phone
  );
}
function open(event) {
  const now = Date.now();
  return (
    event.status === "published" &&
    event.formPublished &&
    (!event.opensAt || +event.opensAt <= now) &&
    event.closesAt &&
    +event.closesAt > now
  );
}
function participationSettings(body) {
  check(
    ["solo", "team", "solo_or_team"].includes(body.mode),
    "Choose participation type",
  );
  if (body.mode === "solo_or_team")
    check(
      body.minTeamSize === undefined || Number(body.minTeamSize) === 1,
      "Solo or team events must allow individual registration",
    );
  const min = body.mode === "team" ? Number(body.minTeamSize) : 1,
    max = body.mode === "solo" ? 1 : Number(body.maxTeamSize);
  check(
    Number.isInteger(min) &&
      Number.isInteger(max) &&
      min >= 1 &&
      max >= min &&
      max <= 100,
    "Invalid team size (1–100)",
  );
  return { mode: body.mode, minTeamSize: min, maxTeamSize: max };
}
function eventBody(body) {
  const participation = participationSettings(body);
  check(
    ["draft", "published", "closed", "archived", "cancelled"].includes(
      body.status,
    ),
    "Invalid event status",
  );
  const opensAt = body.opensAt ? new Date(body.opensAt) : undefined,
    closesAt = body.closesAt ? new Date(body.closesAt) : undefined;
  check(
    (!opensAt || Number.isFinite(+opensAt)) &&
      (!closesAt || Number.isFinite(+closesAt)) &&
      (!opensAt || !closesAt || opensAt < closesAt),
    "Invalid registration dates",
  );
  const list = (v) => {
    check(
      Array.isArray(v || []) && (v || []).length <= 200,
      "Invalid eligibility list",
    );
    return (v || []).map((x) => text(x, 200)).filter(Boolean);
  };
  return {
    title: text(body.title, 200, true),
    description: text(body.description, 20000),
    rules: text(body.rules, 20000),
    contact: text(body.contact, 5000),
    ...participation,
    opensAt: opensAt || null,
    closesAt: closesAt || null,
    status: body.status,
    allowEdits: !!body.allowEdits,
    allowedBranches: list(body.allowedBranches),
  };
}
module.exports = {
  check,
  text,
  fields,
  answers,
  profileComplete,
  open,
  participationSettings,
  eventBody,
};
