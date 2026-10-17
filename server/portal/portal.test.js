const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const crypto = require("crypto");
const request = require("supertest");
const {
  MongoMemoryReplSet,
  MongoMemoryServer,
} = require("mongodb-memory-server");
process.env.JWT_SECRET = "isolated-test-secret-not-for-production-use";
process.env.NODE_ENV = "test";
process.env.FRONTEND_URL = "http://localhost:5173";
delete process.env.SMTP_HOST;
const models = require("./models");
const auth = require("./auth");
const validation = require("./validation");
const realVerify = auth.verifyFirebase;
// Stub only the external Firebase service. All sessions, permissions and DB writes are real.
auth.verifyFirebase = async (token) => {
  validation.check(token.startsWith("fixture-"), "Invalid token", 401);
  return { uid: token, email: `${token}@gmail.com`, name: token };
};
const app = require("../app");
const base = "/api/v1/portal";
const origin = "http://localhost:5173";
let repl,
  admin,
  coordinator,
  outsider,
  category,
  otherCategory,
  coordId,
  alice,
  bob,
  aliceUser,
  bobUser;
const send = (agent, method, path, body = {}) =>
  agent[method](base + path)
    .set("Origin", origin)
    .send(body);
const profile = {
  name: "Participant",
  college: "External College",
  registrationNumber: "EXT-101",
  course: "B.Tech",
  year: 1,
  branch: "CSE",
  phone: "9999999999",
  acknowledged: true,
};
const question = {
  id: "submission",
  label: "Drive submission",
  type: "link",
  required: true,
  help: "Share with reviewers",
  options: [],
};
const eventBody = (extra) => ({
  categoryId: category._id,
  title: "Test event",
  description: "Description",
  rules: "Rules",
  contact: "coord@example.com",
  mode: "solo",
  status: "published",
  allowEdits: true,
  formPublished: true,
  closesAt: new Date(Date.now() + 24 * 3600000).toISOString(),
  fields: [question],
  ...extra,
});

async function createFixtureEvent(extra = {}) {
  const body = eventBody(extra),
    { fields, ...rest } = body;
  return JSON.parse(
    JSON.stringify(
      await models.Subevent.create({
        ...rest,
        formVersions: [{ version: 1, fields }],
      }),
    ),
  );
}
before(async () => {
  repl = await (
    process.env.CA_TEST_STANDALONE ? MongoMemoryServer : MongoMemoryReplSet
  ).create({
    replSet: { count: 1 },
    binary: { version: process.env.MONGOMS_VERSION || "7.0.14" },
  });
  await mongoose.connect(repl.getUri());
  await Promise.all(
    Object.values(models)
      .filter((m) => m.init)
      .map((m) => m.init()),
  );
  await models.Staff.create({
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
    passwordHash: await auth.bcrypt.hash("InitialAdmin12345", 12),
    temporaryPasswordExpires: new Date(Date.now() + 3600000),
  });
  admin = request.agent(app);
  coordinator = request.agent(app);
  outsider = request.agent(app);
  alice = request.agent(app);
  bob = request.agent(app);
});
after(async () => {
  auth.verifyFirebase = realVerify;
  await mongoose.disconnect();
  if (repl) await repl.stop();
});

test("staff must change the temporary password; participant and staff sessions remain separate", async () => {
  const login = await send(admin, "post", "/staff/login", {
    email: "admin@example.com",
    password: "InitialAdmin12345",
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.staff.mustChangePassword, true);
  assert.equal(login.body.staff.passwordHash, undefined);
  assert.equal((await admin.get(base + "/staff/categories")).status, 403);
  assert.equal(
    (
      await send(admin, "post", "/staff/password", {
        currentPassword: "wrong",
        newPassword: "ChangedAdmin12345",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await send(admin, "post", "/staff/password", {
        currentPassword: "InitialAdmin12345",
        newPassword: "ChangedAdmin12345",
      })
    ).status,
    200,
  );
  assert.equal((await admin.get(base + "/auth/me")).status, 401);
  assert.equal(
    (
      await admin
        .post(base + "/staff/categories")
        .send({ festival: "culrav", name: "x", slug: "x" })
    ).status,
    403,
  );
});

test("admin creates categories and coordinator; only assigned categories are writable", async () => {
  category = (
    await send(admin, "post", "/staff/categories", {
      festival: "avishkar",
      name: "CyberQuest",
      slug: "cyberquest",
    })
  ).body.category;
  otherCategory = (
    await send(admin, "post", "/staff/categories", {
      festival: "culrav",
      name: "Darkroom",
      slug: "darkroom",
    })
  ).body.category;
  const invitation = await send(admin, "post", "/staff/coordinators", {
    name: "Coordinator",
    email: "coord@example.com",
    categoryIds: [category._id],
  });
  assert.equal(invitation.status, 200);
  assert.ok(invitation.body.temporaryPassword);
  coordId = invitation.body.staff._id;
  await send(coordinator, "post", "/staff/login", {
    email: "coord@example.com",
    password: invitation.body.temporaryPassword,
  });
  assert.equal(
    (await send(coordinator, "post", "/staff/events", eventBody({}))).status,
    403,
  );
  await send(coordinator, "post", "/staff/password", {
    currentPassword: invitation.body.temporaryPassword,
    newPassword: "ChangedCoordinator12345",
  });
  assert.equal(
    (
      await send(
        coordinator,
        "post",
        "/staff/events",
        eventBody({ categoryId: otherCategory._id }),
      )
    ).status,
    405,
  );
  assert.equal(
    (
      await send(coordinator, "post", "/staff/categories", {
        festival: "culrav",
        name: "No",
        slug: "no",
      })
    ).status,
    403,
  );
  const own = await coordinator.get(base + "/staff/categories");
  assert.equal(own.body.categories.length, 1);
  const reassignment = await send(admin, "post", "/staff/coordinators", {
    name: "Coordinator",
    email: "coord@example.com",
    categoryIds: [category._id],
  });
  assert.equal(reassignment.body.temporaryPassword, undefined);
  assert.equal((await coordinator.get(base + "/staff/categories")).status, 401);
  await send(coordinator, "post", "/staff/login", {
    email: "coord@example.com",
    password: "ChangedCoordinator12345",
  });
});

test("draft questions stay staff-only until the form is published", async () => {
  const draftQuestion = { ...question, label: "Unpublished secret question" };
  const event = await createFixtureEvent({
    title: "Draft form event",
    formPublished: false,
    fields: [draftQuestion],
  });
  const publicPath = base + `/events/${event._id}`;
  const publicDraft = await request(app).get(publicPath);
  assert.equal(publicDraft.status, 200);
  assert.deepEqual(publicDraft.body.event.fields, []);
  assert.equal(publicDraft.body.event.formVersions, undefined);
  assert.ok(!JSON.stringify(publicDraft.body).includes(draftQuestion.label));

  const staffEvents = await coordinator.get(base + "/staff/events");
  const staffEvent = staffEvents.body.events.find((e) => e._id === event._id);
  assert.equal(staffEvent.formVersions[0].fields[0].label, draftQuestion.label);

  const updatedQuestion = {
    ...draftQuestion,
    label: "Revised secret question",
  };
  const update = async (revision, formPublished) =>
    send(coordinator, "put", `/staff/events/${event._id}`, {
      description: event.description,
      rules: event.rules,
      fields: [updatedQuestion],
      revision,
      formPublished,
    });
  const savedDraft = await update(staffEvent.revision, false);
  assert.equal(savedDraft.status, 200);
  assert.equal(savedDraft.body.event.currentVersion, 2);
  const publicUpdatedDraft = await request(app).get(publicPath);
  assert.deepEqual(publicUpdatedDraft.body.event.fields, []);
  assert.ok(
    !JSON.stringify(publicUpdatedDraft.body).includes(updatedQuestion.label),
  );

  const published = await update(savedDraft.body.event.revision, true);
  assert.equal(published.status, 200);
  const publicPublished = await request(app).get(publicPath);
  assert.equal(
    publicPublished.body.event.fields[0].label,
    updatedQuestion.label,
  );
  assert.equal(publicPublished.body.event.formVersions, undefined);

  const unpublished = await update(published.body.event.revision, false);
  assert.equal(unpublished.status, 200);
  const publicUnpublished = await request(app).get(publicPath);
  assert.deepEqual(publicUnpublished.body.event.fields, []);
});

test("only admins can change event descriptions and rules", async () => {
  const event = await createFixtureEvent({ title: "Staff copy policy" });
  for (const change of [
    { description: "Coordinator override" },
    { rules: "Coordinator override" },
  ]) {
    const denied = await send(
      coordinator,
      "put",
      `/staff/events/${event._id}`,
      {
        revision: event.revision,
        fields: [question],
        ...change,
      },
    );
    assert.equal(denied.status, 403);
  }
  const adminEdit = await send(admin, "put", `/staff/events/${event._id}`, {
    ...eventBody({
      title: event.title,
      description: "Admin description",
      rules: "Admin rule one\nAdmin rule two",
      closesAt: event.closesAt,
    }),
    revision: event.revision,
  });
  assert.equal(adminEdit.status, 200);
  assert.equal(adminEdit.body.event.description, "Admin description");
  assert.equal(adminEdit.body.event.rules, "Admin rule one\nAdmin rule two");
  const coordinatorEdit = await send(
    coordinator,
    "put",
    `/staff/events/${event._id}`,
    {
      revision: adminEdit.body.event.revision,
      fields: [question],
      coordinators: [{ name: "Event coordinator", phone: "9999999999" }],
    },
  );
  assert.equal(coordinatorEdit.status, 200);
  assert.equal(coordinatorEdit.body.event.description, "Admin description");
  assert.equal(
    coordinatorEdit.body.event.rules,
    "Admin rule one\nAdmin rule two",
  );
});

test("Google sign-in creates permanent, concurrent-safe CA IDs and requires profiles", async () => {
  const first = await send(alice, "post", "/auth/google", {
    idToken: "fixture-alice",
  });
  assert.equal(first.status, 200);
  aliceUser = first.body.user;
  assert.match(aliceUser.caId, /^CA-\d{4}-\d{6}$/);
  assert.equal(first.body.user.firebaseUid, undefined);
  const again = await send(alice, "post", "/auth/google", {
    idToken: "fixture-alice",
  });
  assert.equal(again.body.user.caId, aliceUser.caId);
  assert.equal(
    (await send(alice, "post", "/teams", { name: "Incomplete profile" }))
      .status,
    400,
  );
  const withoutAcknowledgement = await send(alice, "patch", "/profile", {
    ...profile,
    acknowledged: false,
  });
  assert.equal(withoutAcknowledgement.status, 400);
  for (const phone of [
    "5999999999",
    "699999999",
    "69999999999",
    "69999abc99",
  ]) {
    const invalidPhone = await send(alice, "patch", "/profile", {
      ...profile,
      phone,
    });
    assert.equal(invalidPhone.status, 400);
    assert.equal(invalidPhone.body.message, "Invalid number");
  }
  const response = await send(alice, "patch", "/profile", {
    ...profile,
    caId: "CA-HACK",
    role: "admin",
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.user.caId, aliceUser.caId);
  assert.equal(response.body.user.role, undefined);
  assert.ok(response.body.user.profileLockedAt);
  const repeat = await send(alice, "patch", "/profile", {
    ...profile,
    name: "Changed name",
    email: "changed@example.com",
  });
  assert.equal(repeat.status, 409);
  const lockedProfile = await send(alice, "get", "/auth/me");
  assert.equal(lockedProfile.body.user.name, profile.name);
  assert.equal(lockedProfile.body.user.email, aliceUser.email);
  const second = await send(bob, "post", "/auth/google", {
    idToken: "fixture-bob",
  });
  bobUser = second.body.user;
  await send(bob, "patch", "/profile", { ...profile, name: "Bob" });
  const records = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      models.Participant.create({
        name: "Concurrent",
        email: `concurrent-${i}@gmail.com`,
        firebaseUid: `concurrent-${i}`,
      }),
    ),
  );
  assert.equal(new Set(records.map((p) => p.caId)).size, 20);
  assert.equal((await alice.get(base + "/staff/events")).status, 401);
});

test("random CA ID allocation skips suffixes used by existing accounts", async () => {
  const codes = mongoose.model("CaIdCode");
  async function unused(start) {
    for (let number = start; number < 1_000_000; number += 1) {
      const suffix = String(number).padStart(6, "0");
      const pattern = new RegExp(`-${suffix}$`);
      if (
        !(await codes.exists({ _id: suffix })) &&
        !(await models.Participant.exists({ caId: pattern })) &&
        !(await models.Staff.exists({ caId: pattern }))
      )
        return number;
    }
    throw new Error("No unused test suffix");
  }
  const oldNumber = await unused(100);
  const freshNumber = await unused(oldNumber + 1);
  const oldSuffix = String(oldNumber).padStart(6, "0");
  await models.Participant.create({
    caId: `CA-2025-${oldSuffix}`,
    name: "Existing CA ID",
    email: "old-ca-id@example.com",
    firebaseUid: "old-ca-id",
  });
  const originalRandomInt = crypto.randomInt;
  const draws = [oldNumber, freshNumber];
  crypto.randomInt = () => draws.shift();
  try {
    assert.equal(
      await models.nextCaId(),
      `CA-${new Date().getUTCFullYear()}-${String(freshNumber).padStart(6, "0")}`,
    );
  } finally {
    crypto.randomInt = originalRandomInt;
  }
  assert.equal(await codes.exists({ _id: oldSuffix }), null);
});

test("solo registration validates answers, blocks duplicate races and keeps form snapshots", async () => {
  let event = await createFixtureEvent({ title: "404" });
  assert.equal(
    (
      await send(coordinator, "put", `/staff/events/${event._id}`, {
        title: "Not permitted",
        revision: event.revision,
        fields: [],
      })
    ).status,
    403,
  );
  const foreignEvent = await createFixtureEvent({
    categoryId: otherCategory._id,
    title: "Foreign category",
  });
  assert.equal(
    (
      await send(coordinator, "put", `/staff/events/${foreignEvent._id}`, {
        description: "No",
        rules: "",
        fields: [],
        revision: 0,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await send(alice, "post", `/events/${event._id}/register`, {
        answers: { submission: "javascript:alert(1)" },
      })
    ).status,
    400,
  );
  const attempts = await Promise.all(
    [1, 2].map(() =>
      send(alice, "post", `/events/${event._id}/register`, {
        answers: { submission: "https://drive.google.com/file/d/test/view" },
        memberIds: [bobUser._id],
      }),
    ),
  );
  assert.deepEqual(attempts.map((r) => r.status).sort(), [201, 409]);
  let registration = attempts.find((r) => r.status === 201).body.registration;
  assert.deepEqual(registration.memberIds, [aliceUser._id]);
  assert.equal(registration.participants[0].caId, aliceUser.caId);
  event = (await coordinator.get(base + "/staff/events")).body.events.find(
    (e) => e._id === event._id,
  );
  const revisedFields = [{ ...question, label: "Updated label" }];
  assert.equal(
    (
      await send(coordinator, "put", `/staff/events/${event._id}`, {
        description: event.description,
        rules: event.rules,
        revision: event.revision,
        formPublished: true,
        fields: revisedFields,
      })
    ).status,
    400,
  );
  const updated = await send(coordinator, "put", `/staff/events/${event._id}`, {
    description: event.description,
    rules: event.rules,
    revision: event.revision,
    formPublished: true,
    responseUpdateDeadline: new Date(Date.now() + 3600000).toISOString(),
    fields: revisedFields,
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.event.currentVersion, 2);
  assert.equal(
    (await models.Registration.findById(registration._id)).fields[0].label,
    question.label,
  );
  const updateNotice = (
    await alice.get(base + "/registrations")
  ).body.registrations.find((item) => item._id === registration._id);
  assert.equal(updateNotice.formUpdateNeeded, true);
  assert.deepEqual(updateNotice.formUpdateAnswers, {});
  const edit = await send(
    alice,
    "patch",
    `/registrations/${registration._id}`,
    {
      revision: registration.revision,
      answers: { submission: "https://drive.google.com/file/d/changed/view" },
    },
  );
  assert.equal(edit.status, 200);
  registration = edit.body.registration;
  assert.equal(
    (
      await send(bob, "patch", `/registrations/${registration._id}`, {
        revision: registration.revision,
        answers: {},
      })
    ).status,
    404,
  );
  const review = await send(
    coordinator,
    "patch",
    `/staff/registrations/${registration._id}`,
    {
      status: "access_required",
      reviewReason: "Please grant access",
      revision: registration.revision,
    },
  );
  assert.equal(review.status, 404);
  const csv = await coordinator.get(
    base + `/staff/events/${event._id}/export?format=csv`,
  );
  assert.equal(csv.status, 200);
  assert.match(csv.text, /CA ID/);
  assert.match(csv.text, /Updated label/);
  const excel = await coordinator
    .get(base + `/staff/events/${event._id}/export?format=xlsx`)
    .buffer(true)
    .parse((response, done) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => done(null, Buffer.concat(chunks)));
      response.on("error", done);
    });
  assert.equal(excel.status, 200);
  assert.match(excel.headers["content-type"], /spreadsheetml/);
  assert.equal(
    (await alice.get(base + `/staff/events/${event._id}/export`)).status,
    401,
  );
  assert.equal(
    (await send(coordinator, "delete", `/staff/events/${event._id}`)).status,
    405,
  );
  assert.ok(await models.Registration.findById(registration._id));
  assert.equal((await models.Subevent.findById(event._id)).status, "published");
});

test("published form revisions request fresh answers without approval", async () => {
  const originalFields = [
    question,
    { id: "note", label: "Original note", type: "text", required: true },
  ];
  const event = await createFixtureEvent({
    title: "Revised response event",
    allowEdits: false,
    fields: originalFields,
  });
  const first = await send(alice, "post", `/events/${event._id}/register`, {
    answers: {
      submission: "https://example.com/original",
      note: "Old answer",
    },
  });
  assert.equal(first.status, 201);
  const registration = first.body.registration;
  await models.Registration.updateOne(
    { _id: registration._id },
    { $set: { status: "accepted", reviewReason: "Legacy decision" } },
  );
  const legacyView = (
    await alice.get(base + "/registrations")
  ).body.registrations.find((item) => item._id === registration._id);
  assert.equal(legacyView.status, "submitted");
  assert.equal(legacyView.reviewReason, undefined);
  const staffEvent = (
    await coordinator.get(base + "/staff/events")
  ).body.events.find((item) => item._id === event._id);
  const latestFields = [
    question,
    { ...originalFields[1], label: "Revised note" },
    { id: "extra", label: "New detail", type: "text", required: true },
  ];
  const deadline = new Date(Date.now() + 3600000).toISOString();
  const published = await send(
    coordinator,
    "put",
    `/staff/events/${event._id}`,
    {
      description: staffEvent.description,
      rules: staffEvent.rules,
      revision: staffEvent.revision,
      formPublished: true,
      responseUpdateDeadline: deadline,
      fields: latestFields,
    },
  );
  assert.equal(published.status, 200);
  assert.equal(
    (
      await send(coordinator, "put", `/staff/events/${event._id}`, {
        description: published.body.event.description,
        rules: published.body.event.rules,
        revision: published.body.event.revision,
        formPublished: true,
        responseUpdateDeadline: null,
        fields: latestFields,
      })
    ).status,
    400,
  );
  const listed = (
    await alice.get(base + "/registrations")
  ).body.registrations.find((item) => item._id === registration._id);
  assert.equal(listed.formUpdateNeeded, true);
  assert.deepEqual(listed.formUpdateAnswers, {
    submission: "https://example.com/original",
  });
  assert.equal(listed.formUpdateFields.length, 3);
  assert.equal(listed.eventId.formVersions, undefined);
  const staffList = await coordinator.get(
    base + `/staff/events/${event._id}/registrations`,
  );
  assert.equal(staffList.body.registrations[0].formUpdateNeeded, true);

  await models.Subevent.updateOne(
    { _id: event._id },
    {
      $set: {
        status: "closed",
        closesAt: new Date(Date.now() - 1000),
        responseUpdateDeadline: new Date(Date.now() - 1000),
      },
    },
  );
  const revisedAnswers = {
    submission: "https://example.com/original",
    note: "Fresh answer",
    extra: "Added answer",
  };
  assert.equal(
    (
      await send(alice, "patch", `/registrations/${registration._id}`, {
        revision: registration.revision,
        answers: revisedAnswers,
      })
    ).status,
    409,
  );
  await models.Subevent.updateOne(
    { _id: event._id },
    { $set: { responseUpdateDeadline: deadline } },
  );
  const revised = await send(
    alice,
    "patch",
    `/registrations/${registration._id}`,
    {
      revision: registration.revision,
      answers: revisedAnswers,
    },
  );
  assert.equal(revised.status, 200);
  assert.equal(revised.body.registration.formVersion, 2);
  assert.equal(revised.body.registration.status, "submitted");
  assert.equal(revised.body.registration.formUpdateReviewPending, false);
  assert.equal(revised.body.registration.answerHistory.length, 1);
  assert.equal(revised.body.registration.answerHistory[0].status, undefined);
  assert.equal(
    revised.body.registration.answerHistory[0].answers.note,
    "Old answer",
  );
  const refreshed = (
    await alice.get(base + "/registrations")
  ).body.registrations.find((item) => item._id === registration._id);
  assert.equal(refreshed.formUpdateNeeded, false);
  assert.equal(refreshed.canCorrectUpdatedResponse, true);
  assert.equal(refreshed.status, "submitted");
  assert.equal(refreshed.answerHistory[0].status, undefined);
  const corrected = await send(
    alice,
    "patch",
    `/registrations/${registration._id}`,
    {
      revision: refreshed.revision,
      answers: { ...revisedAnswers, extra: "Corrected demo link" },
    },
  );
  assert.equal(corrected.status, 200);
  assert.equal(
    corrected.body.registration.answers.extra,
    "Corrected demo link",
  );
  await models.Subevent.updateOne(
    { _id: event._id },
    { $set: { responseUpdateDeadline: new Date(Date.now() - 1000) } },
  );
  assert.equal(
    (
      await send(alice, "patch", `/registrations/${registration._id}`, {
        revision: corrected.body.registration.revision,
        answers: revisedAnswers,
      })
    ).status,
    409,
  );
  await models.Subevent.updateOne(
    { _id: event._id },
    { $set: { responseUpdateDeadline: deadline } },
  );
  const changedEvent = (
    await coordinator.get(base + "/staff/events")
  ).body.events.find((item) => item._id === event._id);
  const reordered = await send(
    coordinator,
    "put",
    `/staff/events/${event._id}`,
    {
      description: changedEvent.description,
      rules: changedEvent.rules,
      revision: changedEvent.revision,
      formPublished: true,
      responseUpdateDeadline: deadline,
      fields: [...latestFields].reverse(),
    },
  );
  assert.equal(reordered.status, 200);
  assert.equal(
    (await alice.get(base + "/registrations")).body.registrations.find(
      (item) => item._id === registration._id,
    ).formUpdateNeeded,
    false,
  );
});

test("coordinators own both deadlines and a published form needs a registration close", async () => {
  const event = await createFixtureEvent({
    title: "Deadline ownership",
    formPublished: false,
    closesAt: null,
  });
  const staffEvent = (
    await coordinator.get(base + "/staff/events")
  ).body.events.find((item) => item._id === event._id);
  await models.Subevent.updateOne(
    { _id: event._id },
    { $set: { formPublished: true } },
  );
  assert.equal(
    (
      await send(alice, "post", `/events/${event._id}/register`, {
        answers: { submission: "https://example.com/file" },
      })
    ).status,
    409,
  );
  await models.Subevent.updateOne(
    { _id: event._id },
    { $set: { formPublished: false } },
  );
  assert.equal(
    (
      await send(coordinator, "put", `/staff/events/${event._id}`, {
        description: staffEvent.description,
        rules: staffEvent.rules,
        revision: staffEvent.revision,
        formPublished: true,
        fields: [question],
      })
    ).status,
    400,
  );
  const deadline = new Date(Date.now() + 3600000).toISOString();
  const published = await send(
    coordinator,
    "put",
    `/staff/events/${event._id}`,
    {
      description: staffEvent.description,
      rules: staffEvent.rules,
      revision: staffEvent.revision,
      formPublished: true,
      closesAt: deadline,
      fields: [question],
    },
  );
  assert.equal(published.status, 200);
  assert.equal(new Date(published.body.event.closesAt).toISOString(), deadline);
  const adminAttempt = await send(admin, "put", `/staff/events/${event._id}`, {
    ...eventBody({ closesAt: new Date(Date.now() + 7200000).toISOString() }),
    revision: published.body.event.revision,
  });
  assert.equal(adminAttempt.status, 403);
  const adminUpdateAttempt = await send(
    admin,
    "put",
    `/staff/events/${event._id}`,
    {
      ...eventBody({ closesAt: deadline }),
      responseUpdateDeadline: new Date(Date.now() + 7200000).toISOString(),
      revision: published.body.event.revision,
    },
  );
  assert.equal(adminUpdateAttempt.status, 403);
  const extension = await send(
    coordinator,
    "put",
    `/staff/events/${event._id}`,
    {
      description: staffEvent.description,
      rules: staffEvent.rules,
      revision: published.body.event.revision,
      formPublished: true,
      closesAt: new Date(Date.now() + 7200000).toISOString(),
      fields: [question],
    },
  );
  assert.equal(extension.status, 200);
});

test("mixed registration always permits one participant and rejects a higher minimum", async () => {
  const event = await createFixtureEvent({
    title: "Legacy mixed minimum",
    mode: "solo_or_team",
    minTeamSize: 3,
    maxTeamSize: 4,
  });
  const registered = await send(
    alice,
    "post",
    `/events/${event._id}/register`,
    {
      answers: { submission: "https://example.com/solo" },
    },
  );
  assert.equal(registered.status, 201);
  const staffEvent = (
    await coordinator.get(base + "/staff/events")
  ).body.events.find((item) => item._id === event._id);
  assert.equal(
    (
      await send(coordinator, "put", `/staff/events/${event._id}`, {
        description: staffEvent.description,
        rules: staffEvent.rules,
        revision: staffEvent.revision,
        formPublished: true,
        mode: "solo_or_team",
        minTeamSize: 2,
        maxTeamSize: 4,
        fields: [question],
      })
    ).status,
    400,
  );
  const corrected = await send(
    coordinator,
    "put",
    `/staff/events/${event._id}`,
    {
      description: staffEvent.description,
      rules: staffEvent.rules,
      revision: staffEvent.revision,
      formPublished: true,
      mode: "solo_or_team",
      minTeamSize: 1,
      maxTeamSize: 5,
      fields: [question],
    },
  );
  assert.equal(corrected.status, 200);
  assert.equal(corrected.body.event.minTeamSize, 1);
  assert.equal(corrected.body.event.maxTeamSize, 5);
});

test("instructions preserve answers and required changes request review without dropping answers", async () => {
  const event = await createFixtureEvent({ title: "Metadata-only edits" });
  const registered = await send(
    alice,
    "post",
    `/events/${event._id}/register`,
    {
      answers: { submission: "https://example.com/original" },
    },
  );
  assert.equal(registered.status, 201);
  const first = (
    await coordinator.get(base + "/staff/events")
  ).body.events.find((item) => item._id === event._id);
  const helpEdit = await send(
    coordinator,
    "put",
    `/staff/events/${event._id}`,
    {
      description: first.description,
      rules: first.rules,
      revision: first.revision,
      formPublished: true,
      fields: [{ ...question, help: "Updated sharing instructions" }],
    },
  );
  assert.equal(helpEdit.status, 200);
  let listed = (
    await alice.get(base + "/registrations")
  ).body.registrations.find(
    (item) => item._id === registered.body.registration._id,
  );
  assert.equal(listed.formUpdateNeeded, false);
  const requiredEdit = await send(
    coordinator,
    "put",
    `/staff/events/${event._id}`,
    {
      description: first.description,
      rules: first.rules,
      revision: helpEdit.body.event.revision,
      formPublished: true,
      responseUpdateDeadline: new Date(Date.now() + 3600000).toISOString(),
      fields: [
        { ...question, help: "Updated sharing instructions", required: false },
      ],
    },
  );
  assert.equal(requiredEdit.status, 200);
  listed = (await alice.get(base + "/registrations")).body.registrations.find(
    (item) => item._id === registered.body.registration._id,
  );
  assert.equal(listed.formUpdateNeeded, true);
  assert.deepEqual(listed.formUpdateAnswers, {
    submission: "https://example.com/original",
  });
  const csv = await coordinator.get(
    base + `/staff/events/${event._id}/export?format=csv`,
  );
  assert.equal(csv.status, 200);
  assert.equal(
    (csv.text.split(/\r?\n/)[0].match(/Drive submission/g) || []).length,
    1,
  );
});

test("team registrations require acceptance and leadership, then lock the roster", async () => {
  const event = await createFixtureEvent({
    title: "Team contest",
    mode: "team",
    minTeamSize: 2,
    maxTeamSize: 3,
  });
  const team = (await send(alice, "post", "/teams", { name: "Builders" })).body
    .team;
  assert.equal(
    (
      await send(alice, "post", `/teams/${team._id}/invite`, {
        caId: bobUser.caId,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await send(alice, "post", `/events/${event._id}/register`, {
        teamId: team._id,
        answers: {},
      })
    ).status,
    400,
  );
  assert.equal(
    (await send(alice, "post", `/teams/${team._id}/respond`, { accept: true }))
      .status,
    404,
  );
  assert.equal(
    (await send(bob, "post", `/teams/${team._id}/respond`, { accept: true }))
      .status,
    200,
  );
  assert.equal(
    (
      await send(bob, "post", `/events/${event._id}/register`, {
        teamId: team._id,
        answers: { submission: "https://example.com/file" },
      })
    ).status,
    403,
  );
  const registered = await send(
    alice,
    "post",
    `/events/${event._id}/register`,
    { teamId: team._id, answers: { submission: "https://example.com/file" } },
  );
  assert.equal(registered.status, 201);
  assert.equal(registered.body.registration.participants.length, 2);
  assert.equal(
    (
      await send(bob, "post", `/teams/${team._id}/remove`, {
        memberId: bobUser._id,
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await send(alice, "post", `/teams/${team._id}/invite`, {
        caId: bobUser.caId,
      })
    ).status,
    409,
  );
  const lockedTeam = (await alice.get(base + "/teams")).body.teams.find(
    (item) => item._id === team._id,
  );
  assert.equal(lockedTeam.locked, true);
  assert.equal(lockedTeam.memberIds.length, 2);
  await models.FestTeam.updateOne(
    { _id: team._id },
    { $unset: { membershipLockedAt: "" } },
  );
  assert.equal(
    (
      await send(bob, "post", `/teams/${team._id}/remove`, {
        memberId: bobUser._id,
      })
    ).status,
    409,
  );
  assert.equal(
    (await alice.get(base + "/teams")).body.teams.find(
      (item) => item._id === team._id,
    ).locked,
    true,
  );
  const saved = await models.Registration.findById(
    registered.body.registration._id,
  );
  assert.equal(saved.memberIds.length, 2);
  const mine = await bob.get(base + "/registrations");
  assert.ok(mine.body.registrations.some((r) => r._id === saved.id));
  const staffEvent = (
    await coordinator.get(base + "/staff/events")
  ).body.events.find((item) => item._id === event._id);
  assert.equal(
    (
      await send(coordinator, "put", `/staff/events/${event._id}`, {
        description: staffEvent.description,
        rules: staffEvent.rules,
        revision: staffEvent.revision,
        formPublished: true,
        responseUpdateDeadline: new Date(Date.now() + 3600000).toISOString(),
        fields: [
          question,
          {
            id: "teamDetail",
            label: "Team detail",
            type: "text",
            required: true,
          },
        ],
      })
    ).status,
    200,
  );
  const memberNotice = (
    await bob.get(base + "/registrations")
  ).body.registrations.find((item) => item._id === saved.id);
  assert.equal(memberNotice.formUpdateNeeded, true);
  assert.equal(
    (
      await send(bob, "patch", `/registrations/${saved.id}`, {
        revision: memberNotice.revision,
        answers: {
          submission: "https://example.com/file",
          teamDetail: "Member answer",
        },
      })
    ).status,
    404,
  );
  const leaderNotice = (
    await alice.get(base + "/registrations")
  ).body.registrations.find((item) => item._id === saved.id);
  assert.equal(leaderNotice.formUpdateNeeded, true);
  assert.equal(
    (
      await send(alice, "patch", `/registrations/${saved.id}`, {
        revision: leaderNotice.revision,
        answers: {
          submission: "https://example.com/file",
          teamDetail: "Leader answer",
        },
      })
    ).status,
    200,
  );
});

test("mixed event exports one row per registration and identifies the team leader", async () => {
  const event = await createFixtureEvent({
    title: "Mixed participation",
    mode: "solo_or_team",
    minTeamSize: 1,
    maxTeamSize: 2,
  });
  const team = (await send(alice, "post", "/teams", { name: "Builders" })).body
    .team;
  assert.equal(
    (
      await send(alice, "post", `/teams/${team._id}/invite`, {
        caId: bobUser.caId,
      })
    ).status,
    200,
  );
  assert.equal(
    (await send(bob, "post", `/teams/${team._id}/respond`, { accept: true }))
      .status,
    200,
  );
  const teamRegistration = await send(
    alice,
    "post",
    `/events/${event._id}/register`,
    {
      teamId: team._id,
      answers: { submission: "https://example.com/team" },
    },
  );
  assert.equal(teamRegistration.status, 201);
  const charlie = request.agent(app);
  const charlieLogin = await send(charlie, "post", "/auth/google", {
    idToken: "fixture-charlie",
  });
  assert.equal(charlieLogin.status, 200);
  assert.equal(
    (await send(charlie, "patch", "/profile", { ...profile, name: "Charlie" }))
      .status,
    200,
  );
  const soloRegistration = await send(
    charlie,
    "post",
    `/events/${event._id}/register`,
    {
      answers: { submission: "https://example.com/solo" },
    },
  );
  assert.equal(soloRegistration.status, 201);
  const reversed = [
    ...teamRegistration.body.registration.participants,
  ].reverse();
  await models.Registration.updateOne(
    { _id: teamRegistration.body.registration._id },
    { $set: { participants: reversed }, $unset: { leaderCaId: "" } },
  );
  for (const term of ["Builders", "Bob", bobUser.caId.slice(-6)]) {
    const matches = await coordinator.get(
      base +
        `/staff/events/${event._id}/registrations?q=${encodeURIComponent(term)}`,
    );
    assert.equal(matches.status, 200);
    assert.equal(matches.body.total, 1);
    assert.equal(
      matches.body.registrations[0]._id,
      teamRegistration.body.registration._id,
    );
  }
  const categoryMatches = await coordinator.get(
    base + `/staff/categories/${category._id}/registrations?q=Charlie`,
  );
  assert.equal(categoryMatches.status, 200);
  assert.equal(categoryMatches.body.total, 1);
  assert.equal(
    categoryMatches.body.registrations[0]._id,
    soloRegistration.body.registration._id,
  );
  const literalSearch = await coordinator.get(
    base +
      `/staff/events/${event._id}/registrations?q=${encodeURIComponent(".*")}`,
  );
  assert.equal(literalSearch.status, 200);
  assert.equal(literalSearch.body.total, 0);
  const csv = await coordinator.get(
    base + `/staff/events/${event._id}/export?format=csv`,
  );
  assert.equal(csv.status, 200);
  const lines = csv.text
    .replace(/^\uFEFF/, "")
    .trim()
    .split("\r\n");
  assert.equal(lines.length, 3);
  assert.match(lines[0], /Entry type/);
  assert.match(lines[0], /Member count/);
  assert.match(lines[1], /Builders/);
  assert.match(lines[1], /Team/);
  assert.match(lines[1], new RegExp(aliceUser.caId));
  assert.doesNotMatch(lines[1], new RegExp(bobUser.caId));
  assert.match(lines[2], /Solo/);
  assert.match(lines[2], new RegExp(charlieLogin.body.user.caId));
  const excel = await coordinator
    .get(base + `/staff/events/${event._id}/export?format=xlsx`)
    .buffer(true)
    .parse((response, done) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => done(null, Buffer.concat(chunks)));
      response.on("error", done);
    });
  assert.equal(excel.status, 200);
  const workbook = new (require("exceljs").Workbook)();
  await workbook.xlsx.load(excel.body);
  const sheet = workbook.getWorksheet("Registrations");
  assert.equal(sheet.rowCount, 3);
});

test("CA ID suffix lookup shows basic profile but scopes registrations by staff role", async () => {
  const event = await createFixtureEvent({
    title: "Outside coordinator category",
    categoryId: otherCategory._id,
  });
  await models.Registration.create({
    eventId: event._id,
    categoryId: otherCategory._id,
    submittedBy: aliceUser._id,
    memberIds: [aliceUser._id],
    participants: [{ caId: aliceUser.caId, name: aliceUser.name }],
    formVersion: 1,
    status: "accepted",
  });
  const suffix = aliceUser.caId.slice(-6);
  const found = await coordinator.get(
    base + `/staff/participants/lookup?q=${suffix}`,
  );
  assert.equal(found.status, 200);
  assert.equal(found.body.matches.length, 1);
  assert.equal(found.body.matches[0].caId, aliceUser.caId);
  assert.equal(found.body.matches[0].phone, undefined);
  const id = found.body.matches[0]._id;
  const coordinatorView = await coordinator.get(
    base + `/staff/participants/${id}/registrations`,
  );
  const adminView = await admin.get(
    base + `/staff/participants/${id}/registrations`,
  );
  assert.equal(coordinatorView.status, 200);
  assert.equal(adminView.status, 200);
  assert.equal(coordinatorView.body.participant.caId, aliceUser.caId);
  assert.ok(
    adminView.body.registrations.some((r) => r.eventId?._id === event._id),
  );
  assert.equal(
    adminView.body.registrations.find((r) => r.eventId?._id === event._id)
      .status,
    "submitted",
  );
  assert.ok(
    coordinatorView.body.registrations.every(
      (r) => r.eventId?._id !== event._id,
    ),
  );
  assert.equal(
    (await request(app).get(base + `/staff/participants/lookup?q=${suffix}`))
      .status,
    401,
  );
  assert.equal(
    (await coordinator.get(base + "/staff/participants/lookup?q=bad!")).status,
    400,
  );
});

test("deadlines, eligibility, expired passwords and access revocation are enforced on the server", async () => {
  const closed = await createFixtureEvent({
    title: "Expired",
    closesAt: new Date(Date.now() - 1000).toISOString(),
  });
  assert.equal(
    (
      await send(alice, "post", `/events/${closed._id}/register`, {
        answers: {},
      })
    ).status,
    409,
  );
  const restricted = await createFixtureEvent({
    title: "Restricted",
    allowedBranches: ["ME"],
  });
  assert.equal(
    (
      await send(alice, "post", `/events/${restricted._id}/register`, {
        answers: { submission: "https://example.com" },
      })
    ).status,
    400,
  );
  await send(admin, "patch", `/staff/coordinators/${coordId}`, {
    active: false,
  });
  assert.equal((await coordinator.get(base + "/staff/events")).status, 401);
  assert.equal(
    (
      await send(outsider, "post", "/staff/login", {
        email: "coord@example.com",
        password: "ChangedCoordinator12345",
      })
    ).status,
    401,
  );
  const reset = await send(admin, "patch", `/staff/coordinators/${coordId}`, {
    active: true,
    resetPassword: true,
  });
  await models.Staff.updateOne(
    { _id: coordId },
    { temporaryPasswordExpires: new Date(Date.now() - 1000) },
  );
  assert.equal(
    (
      await send(outsider, "post", "/staff/login", {
        email: "coord@example.com",
        password: reset.body.temporaryPassword,
      })
    ).status,
    401,
  );
});

test("fixed catalog import preserves all 116 existing subevents and never overwrites coordinator edits", async () => {
  const { seedCatalog } = require("./catalog-service");
  assert.deepEqual(await seedCatalog(), { categories: 20, subevents: 116 });
  const fixed = await models.Subevent.findOne({
    fixedKey: "avishkar/cyberquest/0",
  });
  assert.equal(fixed.title, "Insomnia");
  assert.equal(fixed.description, fixed.sourceData.description);
  fixed.description = "Coordinator edit retained";
  await fixed.save();
  await seedCatalog();
  assert.equal(
    (await models.Subevent.findById(fixed.id)).description,
    "Coordinator edit retained",
  );
  assert.equal(
    await models.Subevent.countDocuments({ fixedKey: { $exists: true } }),
    116,
  );
});

test("form validation handles checkbox, number, date and forbidden field IDs", () => {
  assert.throws(() => validation.fields([{ ...question, id: "__proto__" }]));
  assert.throws(() =>
    validation.answers(
      [{ id: "date", label: "Date", type: "date", required: true }],
      { date: "2026-02-30" },
    ),
  );
  const fields = validation.fields([
    { id: "n", label: "Number", type: "number" },
    {
      id: "c",
      label: "Choices",
      type: "checkbox",
      options: ["A", "B"],
      required: true,
    },
  ]);
  assert.deepEqual(validation.answers(fields, { n: "3.5", c: ["A"] }), {
    n: 3.5,
    c: ["A"],
  });
  assert.throws(() => validation.answers(fields, { c: ["Not a choice"] }));
});
