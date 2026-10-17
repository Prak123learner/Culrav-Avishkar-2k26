const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const clientPath = path.join(__dirname, "../../client/src/portal/api.js");
const clientRequire = createRequire(clientPath);
const { transformSync } = clientRequire("esbuild");
function clientApi() {
  const { code } = transformSync(fs.readFileSync(clientPath, "utf8"), {
    format: "cjs",
    define: {
      "import.meta.env": JSON.stringify({
        VITE_API_BASE_URL: "http://localhost:3000/api/v1",
      }),
    },
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(
    clientRequire,
    module,
    module.exports,
  );
  return module.exports;
}
const rejectStatus = (status) => async (config) => {
  const error = new Error(`HTTP ${status}`);
  error.config = config;
  error.response = { status };
  throw error;
};

test("frontend sends credentials and expires only the affected session type", async () => {
  const api = clientApi(),
    expired = [];
  api.onSessionExpired((kind) => expired.push(kind));
  assert.equal(api.portalApi.defaults.withCredentials, true);
  await assert.rejects(
    api.portalApi.get("/staff/events", { adapter: rejectStatus(401) }),
  );
  await assert.rejects(
    api.portalApi.get("/auth/me", { adapter: rejectStatus(401) }),
  );
  await assert.rejects(
    api.portalApi.post(
      "/events/event-id/register",
      {},
      { adapter: rejectStatus(401) },
    ),
  );
  assert.deepEqual(expired, ["staff", "participant", "participant"]);
});
test("incorrect logins, permission denials and network failures do not clear sessions", async () => {
  const api = clientApi(),
    expired = [];
  api.onSessionExpired((kind) => expired.push(kind));
  await assert.rejects(
    api.portalApi.post("/staff/login", {}, { adapter: rejectStatus(401) }),
  );
  await assert.rejects(
    api.portalApi.post("/auth/google", {}, { adapter: rejectStatus(401) }),
  );
  await assert.rejects(
    api.portalApi.get("/staff/audits", { adapter: rejectStatus(403) }),
  );
  await assert.rejects(
    api.portalApi.get("/auth/me", {
      adapter: async () => {
        throw new Error("Offline");
      },
    }),
  );
  assert.deepEqual(expired, []);
});
test("an old unauthorized response cannot clear a newly signed-in session", async () => {
  const api = clientApi(),
    expired = [];
  api.onSessionExpired((kind) => expired.push(kind));
  let release, started;
  const ready = new Promise((resolve) => {
    started = resolve;
  });
  const pending = api.portalApi.get("/staff/me", {
    adapter: (config) =>
      new Promise((resolve, reject) => {
        release = () => rejectStatus(401)(config).catch(reject);
        started();
      }),
  });
  await ready;
  api.advanceSession("staff");
  release();
  await assert.rejects(pending);
  assert.deepEqual(expired, []);
});
test("session listeners are removable and staff changes preserve participant requests", async () => {
  const api = clientApi(),
    expired = [];
  const unsubscribe = api.onSessionExpired((kind) => expired.push(kind));
  const participantVersion = api.sessionVersion("participant");
  api.advanceSession("staff");
  assert.equal(api.sessionVersion("participant"), participantVersion);
  unsubscribe();
  await assert.rejects(
    api.portalApi.get("/profile", { adapter: rejectStatus(401) }),
  );
  assert.deepEqual(expired, []);
});
