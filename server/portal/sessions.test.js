const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
process.env.JWT_SECRET = "isolated-session-test-secret-not-for-deployment";
process.env.NODE_ENV = "test";
process.env.FRONTEND_URL = "http://localhost:5173";
const models = require("./models");
const auth = require("./auth");
const realVerify = auth.verifyFirebase;
// Only Google verification is stubbed; cookies, JWTs, roles and database reads are real.
auth.verifyFirebase = async (token) => {
  if (!/^session-fixture-/.test(token))
    throw new Error("Unexpected test token");
  return {
    uid: token,
    email: `${token}@example.com`,
    name: "Session participant",
  };
};
const app = require("../app");
const base = "/api/v1/portal";
const origin = "http://localhost:5173";
const send = (agent, path, body = {}) =>
  agent
    .post(base + path)
    .set("Origin", origin)
    .send(body);
const cookie = (response) => response.headers["set-cookie"][0].split(";")[0];
let mongo, admin, coordinator, category, passwordHash;
before(async () => {
  mongo = await MongoMemoryServer.create({
    binary: { version: process.env.MONGOMS_VERSION || "7.0.14" },
  });
  await mongoose.connect(mongo.getUri());
  await Promise.all(
    Object.values(models)
      .filter((model) => model.init)
      .map((model) => model.init()),
  );
  passwordHash = await auth.bcrypt.hash("SessionPassword12345", 12);
  category = await models.Category.create({
    festival: "culrav",
    name: "Session category",
    slug: "session-category",
  });
  admin = await models.Staff.create({
    name: "Session admin",
    email: "sessions-admin@example.com",
    role: "admin",
    passwordHash,
    mustChangePassword: true,
    temporaryPasswordExpires: new Date(Date.now() + 3600000),
  });
  coordinator = await models.Staff.create({
    name: "Session coordinator",
    email: "sessions-coord@example.com",
    role: "coordinator",
    passwordHash,
    mustChangePassword: false,
    categoryIds: [category._id],
  });
});
after(async () => {
  auth.verifyFirebase = realVerify;
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test("admin session restores and password change invalidates the previous cookie", async () => {
  const agent = request.agent(app);
  const login = await send(agent, "/staff/login", {
    email: admin.email,
    password: "SessionPassword12345",
  });
  assert.equal(login.status, 200);
  assert.match(login.headers["set-cookie"][0], /HttpOnly/i);
  assert.match(login.headers["set-cookie"][0], /SameSite=Lax/i);
  assert.match(login.headers["set-cookie"][0], /Max-Age=28800/i);
  const old = cookie(login);
  assert.equal((await agent.get(base + "/staff/audits")).status, 403);
  const changed = await send(agent, "/staff/password", {
    currentPassword: "SessionPassword12345",
    newPassword: "UpdatedSessionPassword12345",
  });
  assert.equal(changed.status, 200);
  assert.equal(
    (
      await request(app)
        .get(base + "/staff/me")
        .set("Cookie", old)
    ).status,
    401,
  );
  const restored = await request(app)
    .get(base + "/staff/me")
    .set("Cookie", cookie(changed));
  assert.equal(restored.status, 200);
  assert.equal(restored.body.staff.role, "admin");
  assert.equal(restored.body.staff.passwordHash, undefined);
  assert.equal((await agent.get(base + "/staff/audits")).status, 200);
});

test("coordinator session restores without participant or admin access", async () => {
  const login = await send(request.agent(app), "/staff/login", {
    email: coordinator.email,
    password: "SessionPassword12345",
  });
  assert.equal(login.status, 200);
  const restored = await request(app)
    .get(base + "/staff/me")
    .set("Cookie", cookie(login));
  assert.equal(restored.status, 200);
  assert.equal(restored.body.staff.role, "coordinator");
  assert.equal(
    (
      await request(app)
        .get(base + "/auth/me")
        .set("Cookie", cookie(login))
    ).status,
    401,
  );
  assert.equal(
    (
      await request(app)
        .get(base + "/staff/audits")
        .set("Cookie", cookie(login))
    ).status,
    403,
  );
});

test("participant cookie restores the same Google identity and CA ID", async () => {
  const login = await send(request.agent(app), "/auth/google", {
    idToken: "session-fixture-restore",
  });
  assert.equal(login.status, 200);
  assert.match(login.headers["set-cookie"][0], /HttpOnly/i);
  assert.match(login.headers["set-cookie"][0], /Max-Age=28800/i);
  const restored = await request(app)
    .get(base + "/auth/me")
    .set("Cookie", cookie(login));
  assert.equal(restored.status, 200);
  assert.equal(restored.body.user._id, login.body.user._id);
  assert.equal(restored.body.user.caId, login.body.user.caId);
  assert.equal(restored.body.user.firebaseUid, undefined);
  assert.equal(
    (
      await request(app)
        .get(base + "/staff/me")
        .set("Cookie", cookie(login))
    ).status,
    401,
  );
});

test("participant and staff coexist and participant logout preserves staff", async () => {
  const agent = request.agent(app);
  await send(agent, "/staff/login", {
    email: coordinator.email,
    password: "SessionPassword12345",
  });
  const participantLogin = await send(agent, "/auth/google", {
    idToken: "session-fixture-dual",
  });
  const copiedParticipantCookie = cookie(participantLogin);
  assert.equal((await agent.get(base + "/staff/me")).status, 200);
  assert.equal((await agent.get(base + "/auth/me")).status, 200);
  const logout = await send(agent, "/auth/logout");
  assert.equal(logout.status, 200);
  assert.match(logout.headers["set-cookie"][0], /^ca_participant_session=;/);
  assert.equal((await agent.get(base + "/auth/me")).status, 401);
  assert.equal(
    (
      await request(app)
        .get(base + "/auth/me")
        .set("Cookie", copiedParticipantCookie)
    ).status,
    401,
  );
  assert.equal((await agent.get(base + "/staff/me")).status, 200);
});

test("staff logout preserves the participant session", async () => {
  const agent = request.agent(app);
  const staffLogin = await send(agent, "/staff/login", {
    email: coordinator.email,
    password: "SessionPassword12345",
  });
  const copiedStaffCookie = cookie(staffLogin);
  await send(agent, "/auth/google", {
    idToken: "session-fixture-other-logout",
  });
  const logout = await send(agent, "/staff/logout");
  assert.equal(logout.status, 200);
  assert.match(logout.headers["set-cookie"][0], /^ca_staff_session=;/);
  assert.equal((await agent.get(base + "/staff/me")).status, 401);
  assert.equal(
    (
      await request(app)
        .get(base + "/staff/me")
        .set("Cookie", copiedStaffCookie)
    ).status,
    401,
  );
  assert.equal((await agent.get(base + "/auth/me")).status, 200);
});

test("logout revokes only that login, leaving another device signed in", async () => {
  const first = await send(request(app), "/auth/google", {
    idToken: "session-fixture-two-devices",
  });
  const second = await send(request(app), "/auth/google", {
    idToken: "session-fixture-two-devices",
  });
  const firstCookie = cookie(first);
  const secondCookie = cookie(second);
  assert.notEqual(firstCookie, secondCookie);
  assert.equal(
    (
      await request(app)
        .post(base + "/auth/logout")
        .set("Origin", origin)
        .set("Cookie", firstCookie)
    ).status,
    200,
  );
  assert.equal(
    (
      await request(app)
        .get(base + "/auth/me")
        .set("Cookie", firstCookie)
    ).status,
    401,
  );
  assert.equal(
    (
      await request(app)
        .get(base + "/auth/me")
        .set("Cookie", secondCookie)
    ).status,
    200,
  );
});

test("legacy API is unavailable and portal API remains mounted", async () => {
  for (const path of [
    "/api/v1/auth/login",
    "/api/v1/auth/signup",
    "/api/v1/team",
    "/api/v1/user",
    "/api/v1/event",
    "/api/test",
  ])
    assert.equal((await request(app).get(path)).status, 404, path);
  assert.equal((await request(app).get(base + "/categories")).status, 200);
});

test("growth-collection indexes support member and event access patterns", async () => {
  const teamIndexes = await models.FestTeam.collection.indexes();
  const registrationIndexes = await models.Registration.collection.indexes();
  const has = (indexes, key) =>
    indexes.some((index) => JSON.stringify(index.key) === JSON.stringify(key));
  assert.ok(has(teamIndexes, { memberIds: 1 }));
  assert.ok(has(teamIndexes, { pendingIds: 1 }));
  assert.ok(has(registrationIndexes, { memberIds: 1, createdAt: -1, _id: -1 }));
  assert.ok(has(registrationIndexes, { eventId: 1, createdAt: -1, _id: -1 }));
  assert.ok(
    has(registrationIndexes, { categoryId: 1, createdAt: -1, _id: -1 }),
  );
});

test("production configuration requires a single HTTPS origin", () => {
  const { validateProductionConfig } = require("./deployment");
  const valid = {
    NODE_ENV: "production",
    FRONTEND_URL: "https://fest.example.edu",
    JWT_SECRET: "a".repeat(32),
  };
  assert.doesNotThrow(() => validateProductionConfig(valid));
  for (const bad of [
    "http://fest.example.edu",
    "https://fest.example.edu/path",
    "https://fest.example.edu,https://other.example.edu",
  ])
    assert.throws(() =>
      validateProductionConfig({ ...valid, FRONTEND_URL: bad }),
    );
});

test("expired, tampered and wrong-kind tokens are rejected", async () => {
  const sign = (body, expiresIn = "8h") =>
    jwt.sign(body, process.env.JWT_SECRET, {
      audience: "ca-portal",
      issuer: "culrav-avishkar",
      expiresIn,
    });
  const expired = sign({ id: coordinator.id, kind: "staff", version: 0 }, -1);
  assert.equal(
    (
      await request(app)
        .get(base + "/staff/me")
        .set("Cookie", `ca_staff_session=${expired}`)
    ).status,
    401,
  );
  const wrongKind = sign({
    id: coordinator.id,
    kind: "participant",
    version: 0,
  });
  assert.equal(
    (
      await request(app)
        .get(base + "/staff/me")
        .set("Cookie", `ca_staff_session=${wrongKind}`)
    ).status,
    401,
  );
  assert.equal(
    (
      await request(app)
        .get(base + "/staff/me")
        .set("Cookie", `ca_staff_session=${wrongKind}tampered`)
    ).status,
    401,
  );
});

test("revoked or reassigned coordinator sessions stop working immediately", async () => {
  const login = await send(request.agent(app), "/staff/login", {
    email: coordinator.email,
    password: "SessionPassword12345",
  });
  await models.Staff.updateOne(
    { _id: coordinator.id },
    { $set: { active: false } },
  );
  assert.equal(
    (
      await request(app)
        .get(base + "/staff/me")
        .set("Cookie", cookie(login))
    ).status,
    401,
  );
  await models.Staff.updateOne(
    { _id: coordinator.id },
    { $set: { active: true }, $inc: { sessionVersion: 1 } },
  );
  assert.equal(
    (
      await request(app)
        .get(base + "/staff/me")
        .set("Cookie", cookie(login))
    ).status,
    401,
  );
});

test("production login sets a Secure session cookie", async () => {
  process.env.NODE_ENV = "production";
  try {
    const login = await send(request(app), "/staff/login", {
      email: coordinator.email,
      password: "SessionPassword12345",
    });
    assert.equal(login.status, 200);
    assert.match(login.headers["set-cookie"][0], /; Secure/i);
  } finally {
    process.env.NODE_ENV = "test";
  }
});

test("admin audit logs expose only safe actor fields and apply filters", async () => {
  await models.Audit.create({
    staffId: coordinator._id,
    action: "event.update",
    targetId: category.id,
  });
  const agent = request.agent(app);
  const login = await send(agent, "/staff/login", {
    email: admin.email,
    password: "UpdatedSessionPassword12345",
  });
  assert.equal(login.status, 200);
  const logs = await agent
    .get(base + "/staff/audits")
    .query({ actor: coordinator.email, action: "event.update" });
  assert.equal(logs.status, 200);
  assert.equal(logs.body.total, 1);
  assert.equal(logs.body.logs[0].staffId.email, coordinator.email);
  assert.equal(logs.body.logs[0].staffId.passwordHash, undefined);
  assert.equal((await request(app).get(base + "/staff/audits")).status, 401);
  assert.equal(
    (await agent.get(base + "/staff/audits").query({ from: "invalid" })).status,
    400,
  );
});
