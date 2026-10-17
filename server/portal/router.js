const express = require("express");
const { registrationWrite } = require("./database");
const {
  needsFormUpdate,
  carriedAnswers,
  currentFields,
} = require("./form-update");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const validator = require("validator");
const {
  Participant,
  Staff,
  Category,
  Subevent,
  FestTeam,
  Registration,
  Audit,
} = require("./models");
const v = require("./validation");
const a = require("./auth");
const { sendEmail } = require("../utils/email");
const router = express.Router();
const async = a.wrap;
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origins = (process.env.FRONTEND_URL || "http://localhost:5173")
      .split(",")
      .map((x) => x.trim());
    if (!origins.includes(req.get("origin")))
      return res.status(403).json({ message: "Request origin is not allowed" });
  }
  next();
});
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) =>
    `${ipKeyGenerator(req.ip)}:${String(req.body?.email || "password-change")
      .trim()
      .toLowerCase()
      .slice(0, 320)}`,
});
// Participants share campus NATs. Limit verified identities separately, not all
// festival sign-ins behind one IP to 30 attempts per 15 minutes.
const googleBudget = rateLimit({
  windowMs: 60000,
  limit: 5000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
const identityLimit = rateLimit({
  windowMs: 15 * 60000,
  limit: 30,
  keyGenerator: (req) => `firebase:${req.firebaseIdentity.uid}`,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
const profileLookupLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: (req) => `staff:${req.staff.id}`,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
const profile = (p) => ({
  caId: p.caId,
  name: p.name,
  email: p.email,
  college: p.college,
  registrationNumber: p.registrationNumber,
  course: p.course,
  year: p.year,
  branch: p.branch,
  phone: p.phone,
});
async function eventForStaff(req) {
  const event = await Subevent.findById(req.params.id);
  v.check(event, "Event not found", 404);
  a.categoryAccess(req.staff, event.categoryId);
  return event;
}
const audit = (req, action, targetId) =>
  Audit.create({ staffId: req.staff.id, action, targetId: String(targetId) });
function registrationView(registration, event, includeForm = false) {
  const data = registration.toObject();
  // Older registrations may have review decisions. They are all submissions now.
  data.status = "submitted";
  delete data.reviewReason;
  delete data.formUpdateReviewPending;
  for (const entry of data.answerHistory || []) {
    delete entry.status;
    delete entry.reviewReason;
  }
  const latest = event ? currentFields(event) : [];
  data.formUpdateNeeded = !!(
    event?.formPublished && needsFormUpdate(registration.fields, latest)
  );
  data.formUpdateDeadline = event?.responseUpdateDeadline || null;
  data.canCorrectUpdatedResponse = !!(
    event?.formPublished &&
    ["published", "closed"].includes(event.status) &&
    !data.formUpdateNeeded &&
    registration.answerHistory?.length &&
    event.responseUpdateDeadline &&
    +event.responseUpdateDeadline > Date.now()
  );
  if (data.formUpdateNeeded && includeForm) {
    data.formUpdateFields = latest;
    data.formUpdateAnswers = carriedAnswers(
      registration.fields,
      latest,
      registration.answers,
    );
  }
  if (data.eventId?.formVersions) delete data.eventId.formVersions;
  return data;
}
function responseSearch(value) {
  const query = v.text(value, 80);
  if (!query) return null;
  const literal = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = { $regex: literal, $options: "i" };
  return [
    { teamName: match },
    { "participants.name": match },
    { "participants.caId": match },
  ];
}

router.post(
  "/auth/google",
  googleBudget,
  async(async (req, res, next) => {
    v.check(
      typeof req.body.idToken === "string" && req.body.idToken.length < 20000,
      "Firebase ID token is required",
    );
    req.firebaseIdentity = await a.verifyFirebase(req.body.idToken);
    next();
  }),
  identityLimit,
  async(async (req, res) => {
    const identity = req.firebaseIdentity;
    let participant = await Participant.findOne({ firebaseUid: identity.uid });
    if (!participant) {
      v.check(
        !(await Participant.exists({ email: identity.email.toLowerCase() })),
        "This email belongs to a different identity. Contact the admin.",
        409,
      );
      try {
        participant = await Participant.create({
          firebaseUid: identity.uid,
          email: identity.email,
          name: identity.name || identity.email.split("@")[0],
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
        participant = await Participant.findOne({ firebaseUid: identity.uid });
        if (!participant) throw error;
      }
    }
    await a.issue(res, participant, "participant");
    res.json({ user: a.publicActor(participant) });
  }),
);
router.get("/auth/me", a.participant, (req, res) =>
  res.json({ user: a.publicActor(req.participant) }),
);
router.post(
  "/auth/logout",
  async(async (req, res) => {
    await a.revoke(req, "participant");
    res.clearCookie(a.cookie("participant"), a.options());
    res.json({ success: true });
  }),
);
router.patch(
  "/profile",
  a.participant,
  async(async (req, res) => {
    v.check(
      !req.participant.profileLockedAt && !v.profileComplete(req.participant),
      "Your profile has already been saved and cannot be edited",
      409,
    );
    v.check(
      req.body.acknowledged === true,
      "Review your details and confirm them before saving",
    );
    const profile = {};
    for (const field of [
      "name",
      "college",
      "registrationNumber",
      "course",
      "branch",
      "phone",
    ])
      profile[field] = v.text(
        req.body[field],
        field === "phone" ? 30 : 200,
        true,
      );
    v.check(/^[6-9][0-9]{9}$/.test(profile.phone), "Invalid number");
    v.check(
      ["B.Tech", "MBA", "MCA"].includes(profile.course),
      "Select a valid course",
    );
    const years = { "B.Tech": 4, MBA: 2, MCA: 3 };
    v.check(
      typeof req.body.year === "number" || typeof req.body.year === "string",
      "Select your year",
    );
    profile.year = Number(req.body.year);
    v.check(
      Number.isInteger(profile.year) &&
        profile.year >= 1 &&
        profile.year <= years[profile.course],
      "Select a valid year for your course",
    );
    const participant = await Participant.findOneAndUpdate(
      { _id: req.participant._id, profileLockedAt: null },
      { $set: { ...profile, profileLockedAt: new Date() } },
      { new: true, runValidators: true },
    );
    v.check(participant, "Your profile has already been saved", 409);
    res.json({ user: a.publicActor(participant) });
  }),
);
router.post(
  "/staff/login",
  authLimit,
  async(async (req, res) => {
    const email = v.text(req.body.email, 320, true).toLowerCase();
    const actor = await Staff.findOne({ email }).select("+passwordHash");
    const valid =
      typeof req.body.password === "string" && req.body.password.length <= 128;
    // Perform a hash comparison even for unknown accounts to reduce account enumeration.
    const hash =
      actor?.passwordHash ||
      "$2b$12$8CxrY6MbK.ybQy2Dm7ZpEuP7qrS7mX1xPXpqU0uWAM8vmgk4R4vgO";
    const matches = await a.bcrypt.compare(
      valid ? req.body.password : "",
      hash,
    );
    v.check(
      actor && actor.active && valid && matches,
      "Invalid email or password",
      401,
    );
    v.check(
      !actor.mustChangePassword || +actor.temporaryPasswordExpires > Date.now(),
      "Temporary password expired. Ask the admin to reset it.",
      401,
    );
    await a.issue(res, actor, "staff");
    res.json({ staff: a.publicActor(actor) });
  }),
);
router.get(
  "/staff/me",
  async(async (req, res) =>
    res.json({ staff: a.publicActor(await a.authenticate(req, "staff")) }),
  ),
);
router.post(
  "/staff/logout",
  async(async (req, res) => {
    await a.revoke(req, "staff");
    res.clearCookie(a.cookie("staff"), a.options());
    res.json({ success: true });
  }),
);
router.post(
  "/staff/password",
  authLimit,
  async(async (req, res) => {
    const identity = await a.authenticate(req, "staff");
    const actor = await Staff.findById(identity.id).select("+passwordHash");
    v.check(
      typeof req.body.currentPassword === "string" &&
        req.body.currentPassword.length <= 128 &&
        (await a.bcrypt.compare(req.body.currentPassword, actor.passwordHash)),
      "Current password is incorrect",
      400,
    );
    v.check(
      !actor.mustChangePassword || +actor.temporaryPasswordExpires > Date.now(),
      "Temporary password expired",
      401,
    );
    const next = a.password(req.body.newPassword);
    v.check(next !== req.body.currentPassword, "Choose a different password");
    actor.passwordHash = await a.bcrypt.hash(next, 12);
    actor.mustChangePassword = false;
    actor.temporaryPasswordExpires = undefined;
    actor.sessionVersion += 1;
    await actor.save();
    await a.issue(res, actor, "staff");
    res.json({ staff: a.publicActor(actor) });
  }),
);

router.get(
  "/categories",
  async(async (req, res) =>
    res.json({
      categories: await Category.find({ archived: false }).sort({
        festival: 1,
        name: 1,
      }),
    }),
  ),
);
router.get(
  "/events",
  async(async (req, res) => {
    const filter = { status: { $in: ["published", "closed", "cancelled"] } };
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;
    const events = await Subevent.find(filter)
      .select("-formVersions -sourceData -rules")
      .populate("categoryId")
      .sort({ title: 1 });
    res.json({ events });
  }),
);
router.get(
  "/event-content",
  async(async (req, res) => {
    const category = await Category.findOne({
      festival: v.text(req.query.festival, 30, true),
      slug: v.text(req.query.category, 100, true),
      archived: false,
    });
    v.check(category, "Category not found", 404);
    const event = await Subevent.findOne({
      categoryId: category._id,
      title: v.text(req.query.title, 200, true),
      status: { $in: ["published", "closed", "cancelled"] },
    }).select("title description rules contact coordinators");
    v.check(event, "Event not found", 404);
    res.json({ event });
  }),
);
router.get(
  "/events/:id",
  async(async (req, res) => {
    const event = await Subevent.findOne({
      _id: req.params.id,
      status: { $in: ["published", "closed", "cancelled"] },
    })
      .select("-sourceData")
      .populate("categoryId");
    v.check(event, "Event not found", 404);
    const data = event.toObject();
    if (data.mode === "solo_or_team") data.minTeamSize = 1;
    data.fields = event.formPublished
      ? event.formVersions.find((f) => f.version === event.currentVersion)
          ?.fields || []
      : [];
    delete data.formVersions;
    res.json({ event: data });
  }),
);

router.get(
  "/staff/categories",
  a.staff,
  async(async (req, res) =>
    res.json({
      categories: await Category.find(
        req.staff.role === "admin"
          ? {}
          : { _id: { $in: req.staff.categoryIds } },
      ).sort({ name: 1 }),
    }),
  ),
);
router.post(
  "/staff/categories",
  a.staff,
  a.admin,
  async(async (req, res) => {
    v.check(
      ["avishkar", "culrav"].includes(req.body.festival),
      "Choose a festival",
    );
    const slug = v.text(req.body.slug, 100, true);
    v.check(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
      "Use a lowercase URL slug",
    );
    const category = await Category.create({
      name: v.text(req.body.name, 200, true),
      slug,
      festival: req.body.festival,
    });
    await audit(req, "category.create", category.id);
    res.status(201).json({ category });
  }),
);
router.patch(
  "/staff/categories/:id",
  a.staff,
  a.admin,
  async(async (req, res) => {
    const category = await Category.findById(req.params.id);
    v.check(category, "Category not found", 404);
    if (req.body.name !== undefined)
      category.name = v.text(req.body.name, 200, true);
    if (typeof req.body.archived === "boolean")
      category.archived = req.body.archived;
    await category.save();
    await audit(req, "category.update", category.id);
    res.json({ category });
  }),
);
router.get(
  "/staff/audits",
  a.staff,
  a.admin,
  async(async (req, res) => {
    const filter = {};
    const page = Number(req.query.page || 1);
    v.check(
      Number.isInteger(page) && page >= 1 && page <= 1000000,
      "Invalid page",
    );
    if (req.query.action) filter.action = v.text(req.query.action, 100, true);
    if (req.query.actor) {
      const search = v
        .text(req.query.actor, 200, true)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const actors = await Staff.find({
        $or: ["name", "email", "caId"].map((key) => ({
          [key]: { $regex: search, $options: "i" },
        })),
      }).select("_id");
      filter.staffId = { $in: actors.map((actor) => actor._id) };
    }
    if (req.query.targetId)
      filter.targetId = v.text(req.query.targetId, 200, true);
    for (const [key, operator] of [
      ["from", "$gte"],
      ["to", "$lt"],
    ]) {
      if (!req.query[key]) continue;
      const date = new Date(v.text(req.query[key], 60, true));
      v.check(Number.isFinite(date.getTime()), "Invalid date filter");
      filter.createdAt = { ...filter.createdAt, [operator]: date };
    }
    if (filter.createdAt?.$gte && filter.createdAt?.$lt)
      v.check(
        filter.createdAt.$gte < filter.createdAt.$lt,
        "End date must follow start date",
      );
    const [logs, total, actions] = await Promise.all([
      Audit.find(filter)
        .select("staffId action targetId createdAt")
        .populate("staffId", "name email caId role")
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * 50)
        .limit(50)
        .lean(),
      Audit.countDocuments(filter),
      Audit.distinct("action"),
    ]);
    const idsFor = (prefix) =>
      logs
        .filter(
          (log) =>
            log.action?.startsWith(`${prefix}.`) &&
            /^[a-f0-9]{24}$/i.test(log.targetId || ""),
        )
        .map((log) => log.targetId);
    const [categories, coordinators, events, registrations] = await Promise.all(
      [
        Category.find({ _id: { $in: idsFor("category") } })
          .select("name festival")
          .lean(),
        Staff.find({ _id: { $in: idsFor("coordinator") } })
          .select("name email")
          .lean(),
        Subevent.find({ _id: { $in: idsFor("event") } })
          .select("title")
          .lean(),
        Registration.find({ _id: { $in: idsFor("registration") } })
          .select("eventId teamName")
          .populate("eventId", "title")
          .lean(),
      ],
    );
    const targets = new Map([
      ...categories.map((item) => [
        `category:${item._id}`,
        `${item.festival} / ${item.name}`,
      ]),
      ...coordinators.map((item) => [
        `coordinator:${item._id}`,
        `${item.name} (${item.email})`,
      ]),
      ...events.map((item) => [`event:${item._id}`, item.title]),
      ...registrations.map((item) => [
        `registration:${item._id}`,
        [item.eventId?.title, item.teamName].filter(Boolean).join(" / ") ||
          "Registration",
      ]),
    ]);
    res.json({
      logs: logs.map((log) => ({
        ...log,
        targetLabel:
          targets.get(`${log.action?.split(".")[0]}:${log.targetId}`) ||
          "Record unavailable",
      })),
      total,
      page,
      actions: actions.sort(),
    });
  }),
);
router.get(
  "/staff/coordinators",
  a.staff,
  a.admin,
  async(async (req, res) =>
    res.json({
      staff: await Staff.find({ role: "coordinator" })
        .sort({ email: 1 })
        .select("-sessionVersion"),
    }),
  ),
);
router.get(
  "/staff/participants/lookup",
  a.staff,
  profileLookupLimit,
  async(async (req, res) => {
    const query = v.text(req.query.q, 30, true).toUpperCase();
    v.check(
      /^CA-\d{4}-\d{6}$/.test(query) || /^\d{1,6}$/.test(query),
      "Enter a full CA ID or its last 1–6 digits",
    );
    const matches = await Participant.find({
      caId: query.startsWith("CA-") ? query : new RegExp(`${query}$`),
    })
      .select("caId name college")
      .sort({ caId: 1 })
      .limit(21)
      .lean();
    res.json({ matches: matches.slice(0, 20), more: matches.length > 20 });
  }),
);
router.get(
  "/staff/participants/:id/registrations",
  a.staff,
  profileLookupLimit,
  async(async (req, res) => {
    const participant = await Participant.findById(req.params.id)
      .select(
        "caId name email college registrationNumber course year branch phone",
      )
      .lean();
    v.check(participant, "Participant not found", 404);
    const filter = { memberIds: participant._id };
    if (req.staff.role !== "admin")
      filter.categoryId = { $in: req.staff.categoryIds };
    const registrations = await Registration.find(filter)
      .select("eventId teamName createdAt")
      .populate({
        path: "eventId",
        select: "title categoryId",
        populate: { path: "categoryId", select: "name festival" },
      })
      .sort({ createdAt: -1, _id: -1 })
      .lean();
    res.json({
      participant,
      registrations: registrations.map((registration) => ({
        ...registration,
        status: "submitted",
      })),
    });
  }),
);
async function deliver(actor, password) {
  if (!process.env.SMTP_HOST)
    return "SMTP not configured. Share this one-time password with the coordinator securely.";
  try {
    await sendEmail({
      to: actor.email,
      subject: "Culrav Avishkar coordinator access",
      text: `Sign in at ${(process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0]}/coordinator/login\nEmail: ${actor.email}\nTemporary password: ${password}\nExpires in 72 hours. Change it on first login.`,
    });
    return "Temporary password emailed.";
  } catch {
    return "Email delivery failed. Share this one-time password securely or reset it later.";
  }
}
router.post(
  "/staff/coordinators",
  a.staff,
  a.admin,
  async(async (req, res) => {
    const email = v.text(req.body.email, 320, true).toLowerCase();
    v.check(validator.isEmail(email), "Invalid email");
    const ids = req.body.categoryIds;
    v.check(
      Array.isArray(ids) &&
        ids.length > 0 &&
        ids.length <= 100 &&
        new Set(ids).size === ids.length,
      "Choose categories",
    );
    v.check(
      (await Category.countDocuments({
        _id: { $in: ids },
        archived: false,
      })) === ids.length,
      "Invalid category selection",
    );
    let actor = await Staff.findOne({ email });
    let temporaryPassword;
    if (!actor) {
      temporaryPassword = a.temporaryPassword();
      actor = await Staff.create({
        email,
        name: v.text(req.body.name, 200, true),
        categoryIds: ids,
        passwordHash: await a.bcrypt.hash(temporaryPassword, 12),
        temporaryPasswordExpires: new Date(Date.now() + 72 * 3600000),
      });
    } else {
      v.check(
        actor.role !== "admin",
        "Cannot change admin through coordinator assignments",
      );
      actor.categoryIds = ids;
      actor.active = true;
      actor.sessionVersion += 1;
      await actor.save();
    }
    await audit(req, "coordinator.assign", actor.id);
    res.json({
      staff: a.publicActor(actor),
      temporaryPassword,
      delivery: temporaryPassword
        ? await deliver(actor, temporaryPassword)
        : "Assignments updated. Existing password retained.",
    });
  }),
);
router.patch(
  "/staff/coordinators/:id",
  a.staff,
  a.admin,
  async(async (req, res) => {
    const actor = await Staff.findOne({
      _id: req.params.id,
      role: "coordinator",
    });
    v.check(actor, "Coordinator not found", 404);
    let temporaryPassword;
    if (typeof req.body.active === "boolean") actor.active = req.body.active;
    if (req.body.resetPassword === true) {
      temporaryPassword = a.temporaryPassword();
      actor.passwordHash = await a.bcrypt.hash(temporaryPassword, 12);
      actor.mustChangePassword = true;
      actor.temporaryPasswordExpires = new Date(Date.now() + 72 * 3600000);
    }
    actor.sessionVersion += 1;
    await actor.save();
    await audit(
      req,
      temporaryPassword
        ? "coordinator.reset"
        : actor.active
          ? "coordinator.activate"
          : "coordinator.revoke",
      actor.id,
    );
    res.json({
      staff: a.publicActor(actor),
      temporaryPassword,
      delivery: temporaryPassword
        ? await deliver(actor, temporaryPassword)
        : "Access updated.",
    });
  }),
);
router.get(
  "/staff/events",
  a.staff,
  async(async (req, res) =>
    res.json({
      events: await Subevent.find(
        req.staff.role === "admin"
          ? {}
          : { categoryId: { $in: req.staff.categoryIds } },
      )
        .select("-sourceData")
        .populate("categoryId")
        .sort({ updatedAt: -1 }),
    }),
  ),
);
router.get(
  "/staff/events/:id/response-status",
  a.staff,
  async(async (req, res) => {
    const event = await eventForStaff(req);
    const hasResponses = !!(await Registration.exists({ eventId: event._id }));
    const affectedVersions = event.formVersions
      .filter((form) => needsFormUpdate(form.fields, currentFields(event)))
      .map((form) => form.version);
    const hasPendingUpdates = !!(
      affectedVersions.length &&
      (await Registration.exists({
        eventId: event._id,
        formVersion: { $in: affectedVersions },
      }))
    );
    res.json({ hasResponses, hasPendingUpdates });
  }),
);
router.post("/staff/events", a.staff, (req, res) =>
  res.status(405).json({
    message:
      "Subevents belong to the fixed festival catalog and cannot be created here.",
  }),
);
router.put(
  "/staff/events/:id",
  a.staff,
  async(async (req, res) => {
    const event = await eventForStaff(req);
    v.check(
      Number(req.body.revision) === event.revision,
      "Event changed. Reload before editing.",
      409,
    );
    const coordinatorKeys = [
      "description",
      "rules",
      "coordinators",
      "fields",
      "revision",
      "formPublished",
      "mode",
      "minTeamSize",
      "maxTeamSize",
      "responseUpdateDeadline",
      "closesAt",
    ];
    if (req.staff.role !== "admin")
      v.check(
        Object.keys(req.body).every((key) => coordinatorKeys.includes(key)),
        "Coordinators can edit only coordinator contacts, participation settings, deadlines and registration forms.",
        403,
      );
    if (req.staff.role !== "admin")
      v.check(
        (req.body.description === undefined ||
          req.body.description === event.description) &&
          (req.body.rules === undefined || req.body.rules === event.rules),
        "Only admins can change the event description and rules",
        403,
      );
    v.check(
      req.body.formPublished === undefined ||
        typeof req.body.formPublished === "boolean",
      "Invalid form publication status",
    );
    let data;
    if (req.staff.role === "admin") {
      v.check(
        req.body.title === event.title &&
          String(req.body.categoryId) === String(event.categoryId),
        "Catalog titles and categories are fixed",
        403,
      );
      v.check(
        req.body.closesAt === undefined ||
          (req.body.closesAt
            ? Number.isFinite(+new Date(req.body.closesAt)) &&
              +new Date(req.body.closesAt) === +event.closesAt
            : !event.closesAt),
        "Only coordinators can change the registration deadline",
        403,
      );
      v.check(
        req.body.responseUpdateDeadline === undefined ||
          (req.body.responseUpdateDeadline
            ? Number.isFinite(+new Date(req.body.responseUpdateDeadline)) &&
              +new Date(req.body.responseUpdateDeadline) ===
                +event.responseUpdateDeadline
            : !event.responseUpdateDeadline),
        "Only coordinators can change the response update deadline",
        403,
      );
      data = v.eventBody({ ...req.body, closesAt: event.closesAt });
    } else
      data = {
        ...v.participationSettings({
          mode: req.body.mode === undefined ? event.mode : req.body.mode,
          minTeamSize:
            (req.body.mode || event.mode) === "solo_or_team"
              ? req.body.minTeamSize
              : req.body.minTeamSize === undefined
                ? event.minTeamSize
                : req.body.minTeamSize,
          maxTeamSize:
            req.body.maxTeamSize === undefined
              ? event.maxTeamSize
              : req.body.maxTeamSize,
        }),
      };
    if (req.staff.role !== "admin" && req.body.closesAt !== undefined) {
      const deadline = req.body.closesAt ? new Date(req.body.closesAt) : null;
      v.check(
        !deadline || Number.isFinite(+deadline),
        "Invalid registration deadline",
      );
      v.check(
        !deadline || !event.opensAt || +deadline > +event.opensAt,
        "Registration deadline must be after opening time",
      );
      data.closesAt = deadline;
    }
    if (req.body.coordinators !== undefined) {
      v.check(
        Array.isArray(req.body.coordinators) &&
          req.body.coordinators.length <= 20,
        "Use up to 20 coordinator contacts",
      );
      data.coordinators = req.body.coordinators.map((person) => {
        v.check(
          person && typeof person === "object",
          "Invalid coordinator contact",
        );
        const name = v.text(person.name, 100, true);
        const phone = v.text(person.phone, 30, true);
        v.check(
          /^[+0-9()\s.-]+$/.test(phone) && /\d/.test(phone),
          "Invalid coordinator phone number",
        );
        return { name, phone };
      });
      data.contact = data.coordinators
        .map((person) => `${person.name} — ${person.phone}`)
        .join("\n");
    }
    data.configurationRequired = false;
    data.formPublished = req.body.formPublished ?? event.formPublished;
    v.check(
      !data.formPublished ||
        (Object.hasOwn(data, "closesAt") ? data.closesAt : event.closesAt),
      "Set a registration deadline before publishing the form",
    );
    if (req.body.responseUpdateDeadline !== undefined) {
      const deadline = req.body.responseUpdateDeadline
        ? new Date(req.body.responseUpdateDeadline)
        : null;
      v.check(
        !deadline || Number.isFinite(+deadline),
        "Invalid response update deadline",
      );
      data.responseUpdateDeadline = deadline;
    }
    const fields = v.fields(req.body.fields || []);
    const oldFields = currentFields(event).map((f) => f.toObject());
    const normalize = (items) =>
      JSON.stringify(
        items.map((f) => ({
          id: f.id,
          label: f.label,
          type: f.type,
          required: f.required,
          help: f.help || "",
          options: f.options || [],
        })),
      );
    const fieldsChanged = normalize(oldFields) !== normalize(fields);
    if (fieldsChanged) {
      event.currentVersion += 1;
      event.formVersions.push({ version: event.currentVersion, fields });
    }
    const affectedVersions = event.formVersions
      .filter((form) => needsFormUpdate(form.fields, fields))
      .map((form) => form.version);
    if (
      data.formPublished &&
      affectedVersions.length &&
      (await Registration.exists({
        eventId: event.id,
        formVersion: { $in: affectedVersions },
      }))
    ) {
      const deadline = Object.hasOwn(data, "responseUpdateDeadline")
        ? data.responseUpdateDeadline
        : event.responseUpdateDeadline;
      v.check(
        deadline && +deadline > Date.now(),
        "Set a future response update deadline before publishing changed questions",
      );
    }
    Object.assign(event, data);
    event.revision += 1;
    const updated = await Subevent.findOneAndUpdate(
      { _id: event.id, revision: req.body.revision },
      {
        $set: {
          ...data,
          currentVersion: event.currentVersion,
          formVersions: event.formVersions,
        },
        $inc: { revision: 1 },
      },
      { new: true, runValidators: true },
    );
    v.check(updated, "Event changed. Reload before editing.", 409);
    await audit(req, "event.update", event.id);
    res.json({ event: updated });
  }),
);
router.delete("/staff/events/:id", a.staff, (req, res) =>
  res
    .status(405)
    .json({ message: "Fixed catalog subevents cannot be deleted." }),
);

async function requireEditableTeam(team) {
  v.check(team, "Team not found", 404);
  v.check(
    !team.membershipLockedAt &&
      !(await Registration.exists({ teamId: team._id })),
    "This team is locked after event registration. Create a new team for a different roster.",
    409,
  );
}

router.get(
  "/teams",
  a.participant,
  async(async (req, res) => {
    const teams = await FestTeam.find({
      $or: [
        { memberIds: req.participant.id },
        { pendingIds: req.participant.id },
      ],
    })
      .populate("memberIds", "name caId college")
      .populate("pendingIds", "name caId");
    const registeredIds = new Set(
      (
        await Registration.distinct("teamId", {
          teamId: { $in: teams.map((team) => team._id) },
        })
      ).map(String),
    );
    res.json({
      teams: teams.map((team) => ({
        ...team.toObject(),
        locked:
          !!team.membershipLockedAt || registeredIds.has(String(team._id)),
      })),
    });
  }),
);
router.post(
  "/teams",
  a.participant,
  async(async (req, res) => {
    v.check(v.profileComplete(req.participant), "Complete your profile first");
    const team = await FestTeam.create({
      name: v.text(req.body.name, 100, true),
      leaderId: req.participant.id,
      memberIds: [req.participant.id],
    });
    res.status(201).json({ team });
  }),
);
router.post(
  "/teams/:id/invite",
  a.participant,
  async(async (req, res) => {
    const target = await Participant.findOne({
      caId: v.text(req.body.caId, 40, true).toUpperCase(),
    });
    v.check(target, "Participant CA ID not found", 404);
    const team = await FestTeam.findOne({
      _id: req.params.id,
      leaderId: req.participant.id,
    });
    v.check(team, "Only the team leader can invite", 403);
    await requireEditableTeam(team);
    v.check(
      !team.memberIds.some((id) => String(id) === target.id) &&
        !team.pendingIds.some((id) => String(id) === target.id),
      "Already a member or invited",
    );
    v.check(
      team.memberIds.length + team.pendingIds.length < 100,
      "Team is full",
    );
    const updated = await FestTeam.findOneAndUpdate(
      { _id: team.id, revision: team.revision, membershipLockedAt: null },
      { $addToSet: { pendingIds: target.id }, $inc: { revision: 1 } },
      { new: true },
    );
    v.check(updated, "Team changed. Retry.", 409);
    res.json({ team: updated });
  }),
);
router.post(
  "/teams/:id/respond",
  a.participant,
  async(async (req, res) => {
    v.check(typeof req.body.accept === "boolean", "Choose accept or decline");
    v.check(
      !req.body.accept || v.profileComplete(req.participant),
      "Complete your profile before joining",
    );
    const update = {
      $pull: { pendingIds: req.participant.id },
      $inc: { revision: 1 },
    };
    if (req.body.accept) update.$addToSet = { memberIds: req.participant.id };
    const team = await FestTeam.findOne({
      _id: req.params.id,
      pendingIds: req.participant.id,
    });
    v.check(team, "Invitation not found", 404);
    await requireEditableTeam(team);
    const updated = await FestTeam.findOneAndUpdate(
      {
        _id: team.id,
        pendingIds: req.participant.id,
        revision: team.revision,
        membershipLockedAt: null,
      },
      update,
      { new: true },
    );
    v.check(updated, "Team changed. Retry.", 409);
    res.json({ team: updated });
  }),
);
router.post(
  "/teams/:id/remove",
  a.participant,
  async(async (req, res) => {
    const memberId = v.text(req.body.memberId, 40, true);
    const team = await FestTeam.findById(req.params.id);
    v.check(team, "Team not found", 404);
    v.check(
      String(team.leaderId) !== memberId,
      "Leader cannot leave. Create another team instead.",
    );
    v.check(
      String(team.leaderId) === req.participant.id ||
        memberId === req.participant.id,
      "Team access denied",
      403,
    );
    await requireEditableTeam(team);
    const updated = await FestTeam.updateOne(
      { _id: team.id, revision: team.revision, membershipLockedAt: null },
      {
        $pull: { memberIds: memberId, pendingIds: memberId },
        $inc: { revision: 1 },
      },
    );
    v.check(updated.matchedCount, "Team changed. Retry.", 409);
    res.json({ success: true });
  }),
);
router.get(
  "/registrations",
  a.participant,
  async(async (req, res) => {
    const registrations = await Registration.find({
      memberIds: req.participant.id,
    })
      .populate(
        "eventId",
        "title status closesAt allowEdits formPublished formVersions currentVersion responseUpdateDeadline",
      )
      .sort({ createdAt: -1, _id: -1 });
    res.json({
      registrations: registrations.map((registration) =>
        registrationView(registration, registration.eventId, true),
      ),
    });
  }),
);
router.post(
  "/events/:id/register",
  a.participant,
  async(async (req, res) => {
    let registration;
    await registrationWrite(async (session) => {
      const event = await Subevent.findById(req.params.id).session(session);
      v.check(event && v.open(event), "Registration is closed", 409);
      const category = await Category.findOne({
        _id: event.categoryId,
        archived: false,
      }).session(session);
      v.check(category, "Category is unavailable", 409);
      let members = [req.participant.id],
        team;
      if (
        event.mode === "team" ||
        (event.mode === "solo_or_team" && req.body.teamId)
      ) {
        team = await FestTeam.findOneAndUpdate(
          { _id: req.body.teamId, leaderId: req.participant.id },
          {
            $inc: { revision: 1 },
            $set: { membershipLockedAt: new Date() },
          },
          { new: true, session },
        );
        v.check(team, "Select a team you lead", 403);
        v.check(
          !team.pendingIds.length,
          "Resolve pending invitations before registering",
        );
        members = team.memberIds;
      }
      v.check(
        members.length >=
          (event.mode === "solo_or_team" ? 1 : event.minTeamSize) &&
          members.length <= event.maxTeamSize,
        "Team size does not meet event requirements",
      );
      const people = await Participant.find({ _id: { $in: members } }).session(
        session,
      );
      v.check(
        people.length === members.length && people.every(v.profileComplete),
        "Every member must complete their profile",
      );
      for (const p of people) {
        v.check(
          !event.allowedBranches.length ||
            event.allowedBranches.some(
              (branch) => branch.toLowerCase() === p.branch.toLowerCase(),
            ),
          `${p.caId} is not eligible for this event`,
        );
      }
      const fields = event.formVersions.find(
        (f) => f.version === event.currentVersion,
      ).fields;
      const data = v.answers(fields, req.body.answers || {});
      v.check(
        !(await Registration.exists({
          eventId: event.id,
          memberIds: { $in: members },
        }).session(session)),
        "A member is already registered for this event",
        409,
      );
      // Serialize registration against edits/deletion/closure of this event.
      await Subevent.updateOne(
        { _id: event.id },
        { $inc: { revision: 1 } },
        { session },
      );
      [registration] = await Registration.create(
        [
          {
            eventId: event.id,
            categoryId: event.categoryId,
            submittedBy: req.participant.id,
            leaderCaId: req.participant.caId,
            teamId: team?.id,
            teamName: team?.name,
            memberIds: members,
            participants: people.map(profile),
            formVersion: event.currentVersion,
            fields,
            answers: data,
          },
        ],
        { session },
      );
    });
    res.status(201).json({ registration });
  }),
);
router.patch(
  "/registrations/:id",
  a.participant,
  async(async (req, res) => {
    let result;
    await registrationWrite(async (session) => {
      const registration = await Registration.findOne({
        _id: req.params.id,
        submittedBy: req.participant.id,
      }).session(session);
      v.check(registration, "Registration not found", 404);
      const event = await Subevent.findById(registration.eventId).session(
        session,
      );
      v.check(event, "Event not found", 404);
      const latest = currentFields(event);
      const updatingForm =
        event.formPublished && needsFormUpdate(registration.fields, latest);
      const correctingUpdatedForm =
        !updatingForm &&
        event.formPublished &&
        registration.answerHistory.length > 0 &&
        ["published", "closed"].includes(event.status) &&
        event.responseUpdateDeadline &&
        +event.responseUpdateDeadline > Date.now();
      if (updatingForm)
        v.check(
          ["published", "closed"].includes(event.status) &&
            event.responseUpdateDeadline &&
            +event.responseUpdateDeadline > Date.now(),
          "Response update deadline has passed",
          409,
        );
      else
        v.check(
          correctingUpdatedForm || (event.allowEdits && v.open(event)),
          "Editing is closed",
          409,
        );
      v.check(
        Number(req.body.revision) === registration.revision,
        "Registration changed. Reload.",
        409,
      );
      await Subevent.updateOne(
        { _id: event.id },
        { $inc: { revision: 1 } },
        { session },
      );
      const updatedAnswers = v.answers(
        updatingForm || correctingUpdatedForm ? latest : registration.fields,
        req.body.answers || {},
      );
      const changes = {
        $set: {
          answers: updatedAnswers,
          status: "submitted",
          reviewReason: "",
          formUpdateReviewPending: false,
          ...(updatingForm
            ? {
                fields: latest,
                formVersion: event.currentVersion,
              }
            : {}),
        },
        $inc: { revision: 1 },
      };
      if (updatingForm)
        changes.$push = {
          answerHistory: {
            formVersion: registration.formVersion,
            fields: registration.fields,
            answers: registration.answers,
            savedAt: new Date(),
          },
        };
      result = await Registration.findOneAndUpdate(
        { _id: registration.id, revision: req.body.revision },
        changes,
        { new: true, session },
      );
      v.check(result, "Registration changed. Reload.", 409);
    });
    res.json({ registration: result });
  }),
);
router.get(
  "/staff/categories/:id/registrations",
  a.staff,
  async(async (req, res) => {
    a.categoryAccess(req.staff, req.params.id);
    const category = await Category.findById(req.params.id);
    v.check(category, "Category not found", 404);
    const page = Math.max(1, Math.floor(Number(req.query.page) || 1));
    const filter = { categoryId: category._id };
    const search = responseSearch(req.query.q);
    if (search) filter.$or = search;
    if (req.query.eventId) {
      const event = await Subevent.findOne({
        _id: req.query.eventId,
        categoryId: category._id,
      });
      v.check(event, "Event does not belong to this category", 404);
      filter.eventId = event._id;
    }
    const [registrations, total] = await Promise.all([
      Registration.find(filter)
        .populate(
          "eventId",
          "title formPublished formVersions currentVersion responseUpdateDeadline",
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * 50)
        .limit(50),
      Registration.countDocuments(filter),
    ]);
    res.json({
      registrations: registrations.map((registration) =>
        registrationView(registration, registration.eventId),
      ),
      total,
      page,
    });
  }),
);
router.get(
  "/staff/events/:id/registrations",
  a.staff,
  async(async (req, res) => {
    const event = await eventForStaff(req);
    const page = Math.max(1, Number(req.query.page) || 1);
    const filter = { eventId: req.params.id };
    const search = responseSearch(req.query.q);
    if (search) filter.$or = search;
    const [registrations, total] = await Promise.all([
      Registration.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * 50)
        .limit(50),
      Registration.countDocuments(filter),
    ]);
    res.json({
      registrations: registrations.map((registration) =>
        registrationView(registration, event),
      ),
      total,
      page,
    });
  }),
);
router.get(
  "/staff/events/:id/export",
  a.staff,
  async(async (req, res) => {
    const event = await eventForStaff(req),
      format = req.query.format === "xlsx" ? "xlsx" : "csv";
    const safe = (val) => {
      let s = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
      return /^[=+\-@\t\r\n]/.test(s) ? `'${s}` : s;
    };
    // One row represents one registration, including team registrations.
    const columnsByQuestion = new Map();
    for (const version of event.formVersions)
      for (const f of version.fields) {
        // Instructions, required flags and order do not change the answer column.
        const signature = JSON.stringify([
          f.id,
          f.label,
          f.type,
          [...(f.options || [])],
        ]);
        if (!columnsByQuestion.has(signature)) {
          columnsByQuestion.set(signature, {
            label: f.label,
            sources: new Map(),
            lastVersion: version.version,
          });
        }
        const column = columnsByQuestion.get(signature);
        column.sources.set(version.version, f.id);
        column.lastVersion = Math.max(column.lastVersion, version.version);
      }
    const columns = [...columnsByQuestion.values()];
    const headers = [
      "Registration ID",
      "Submitted",
      "Team",
      "Entry type",
      "Member count",
      "CA ID",
      "Name",
      "Email",
      "College",
      "College registration number",
      "Course",
      "Year",
      "Branch",
      "Phone",
    ];
    const usedHeaders = new Set(headers.map((header) => header.toLowerCase()));
    for (const column of columns) {
      const newer = columns.some(
        (other) =>
          other.label === column.label &&
          other.lastVersion > column.lastVersion,
      );
      const label = newer ? `${column.label} (earlier form)` : column.label;
      let header = label;
      let suffix = 2;
      while (usedHeaders.has(header.toLowerCase()))
        header = `${label} (${suffix++})`;
      usedHeaders.add(header.toLowerCase());
      headers.push(header);
    }
    res.set(
      "Content-Disposition",
      `attachment; filename="registrations-${event.id}.${format}"`,
    );
    let sheet, workbook;
    if (format === "xlsx") {
      const ExcelJS = require("exceljs");
      res.type(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
      sheet = workbook.addWorksheet("Registrations");
      sheet.addRow(headers).commit();
    } else {
      res.type("text/csv");
      res.write("\uFEFF");
      res.write(
        headers.map((x) => `"${safe(x).replace(/"/g, '""')}"`).join(",") +
          "\r\n",
      );
    }
    for await (const r of Registration.find({ eventId: event.id })
      .sort({ createdAt: 1, _id: 1 })
      .lean()
      .cursor()) {
      let leaderCaId = r.leaderCaId;
      if (r.teamId && !leaderCaId) {
        const leader = await Participant.findById(r.submittedBy)
          .select("caId")
          .lean();
        leaderCaId = leader?.caId;
      }
      const p =
        r.participants.find((person) => person.caId === leaderCaId) ||
        r.participants[0] ||
        {};
      const row = [
        r._id,
        r.createdAt.toISOString(),
        r.teamName,
        r.teamId ? "Team" : "Solo",
        r.participants.length,
        p.caId,
        p.name,
        p.email,
        p.college,
        p.registrationNumber,
        p.course,
        p.year,
        p.branch,
        p.phone,
        ...columns.map((column) => {
          const id = column.sources.get(r.formVersion);
          return id === undefined ? "" : r.answers[id];
        }),
      ].map(safe);
      if (sheet) sheet.addRow(row).commit();
      else if (
        !res.write(
          row.map((x) => `"${x.replace(/"/g, '""')}"`).join(",") + "\r\n",
        )
      )
        await new Promise((resolve) => res.once("drain", resolve));
    }
    if (workbook) {
      sheet.commit();
      await workbook.commit();
    } else res.end();
  }),
);

// Consistent safe errors for this module, including database constraints and transaction failures.
router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  let status = error.statusCode || 500,
    message = error.isOperational
      ? error.message
      : "Unable to complete this request";
  if (error.code === 11000) {
    status = 409;
    message = "This account or event registration already exists";
  }
  if (error.name === "CastError" || error.name === "ValidationError") {
    status = 400;
    message = "Invalid request data";
  }
  if (status >= 500) console.error("Portal error:", error.message);
  res.status(status).json({ message });
});
module.exports = router;
