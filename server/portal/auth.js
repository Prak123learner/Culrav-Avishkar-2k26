const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Participant, Staff, Session } = require("./models");
const { check } = require("./validation");
const cookie = (kind) => `ca_${kind}_session`;
const options = () => {
  const sameSite = process.env.COOKIE_SAME_SITE || "lax";
  return {
    httpOnly: true,
    // SameSite=None is valid only over HTTPS and is needed only when the
    // frontend and API are on unrelated sites.
    secure: process.env.NODE_ENV === "production" || sameSite === "none",
    sameSite,
    path: "/",
    maxAge: 8 * 60 * 60 * 1000,
  };
};
async function issue(res, actor, kind) {
  const jti = crypto.randomBytes(32).toString("base64url");
  const token = jwt.sign(
    { id: actor.id, kind, version: actor.sessionVersion || 0 },
    process.env.JWT_SECRET,
    {
      expiresIn: "8h",
      audience: "ca-portal",
      issuer: "culrav-avishkar",
      jwtid: jti,
    },
  );
  await Session.create({
    _id: jti,
    actorId: actor._id,
    kind,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
  });
  res.cookie(cookie(kind), token, options());
}
async function authenticate(req, kind) {
  const token = req.cookies[cookie(kind)];
  check(token, "Please sign in", 401);
  let data;
  try {
    data = jwt.verify(token, process.env.JWT_SECRET, {
      audience: "ca-portal",
      issuer: "culrav-avishkar",
    });
  } catch {
    check(false, "Session expired. Sign in again.", 401);
  }
  check(data.kind === kind, "Wrong session type", 401);
  check(data.jti, "Session revoked", 401);
  check(
    await Session.exists({
      _id: data.jti,
      actorId: data.id,
      kind,
      expiresAt: { $gt: new Date() },
    }),
    "Session revoked",
    401,
  );
  const actor = await (kind === "staff" ? Staff : Participant).findById(
    data.id,
  );
  check(
    actor &&
      (kind !== "staff" ||
        (actor.active && actor.sessionVersion === data.version)),
    "Session revoked",
    401,
  );
  return actor;
}
async function revoke(req, kind) {
  const token = req.cookies[cookie(kind)];
  if (!token) return;
  let data;
  try {
    data = jwt.verify(token, process.env.JWT_SECRET, {
      audience: "ca-portal",
      issuer: "culrav-avishkar",
    });
  } catch {
    return;
  }
  if (data.kind === kind && data.jti)
    await Session.deleteOne({ _id: data.jti, actorId: data.id, kind });
}
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const participant = wrap(async (req, res, next) => {
  req.participant = await authenticate(req, "participant");
  next();
});
const staff = wrap(async (req, res, next) => {
  req.staff = await authenticate(req, "staff");
  check(
    !req.staff.mustChangePassword,
    "Change your temporary password first",
    403,
  );
  next();
});
function admin(req, res, next) {
  try {
    check(req.staff.role === "admin", "Admin access required", 403);
    next();
  } catch (e) {
    next(e);
  }
}
function categoryAccess(actor, categoryId) {
  check(
    actor.role === "admin" ||
      actor.categoryIds.some((id) => String(id) === String(categoryId)),
    "Category access denied",
    403,
  );
}
function publicActor(actor) {
  const o = actor.toObject();
  delete o.passwordHash;
  delete o.firebaseUid;
  delete o.sessionVersion;
  return o;
}
function password(value) {
  check(
    typeof value === "string" &&
      value.length >= 12 &&
      value.length <= 128 &&
      /[A-Za-z]/.test(value) &&
      /[0-9]/.test(value),
    "Use 12–128 characters including a letter and a number",
  );
  return value;
}
function temporaryPassword() {
  return `CA-${crypto.randomBytes(18).toString("base64url")}9`;
}
async function verifyFirebase(idToken) {
  check(process.env.FIREBASE_PROJECT_ID, "Firebase is not configured", 503);
  const {
    getApps,
    initializeApp,
    applicationDefault,
    cert,
  } = require("firebase-admin/app");
  const { getAuth } = require("firebase-admin/auth");
  if (!getApps().length)
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      credential:
        process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
          ? cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(
                /\\n/g,
                "\n",
              ),
            })
          : applicationDefault(),
    });
  try {
    const data = await getAuth().verifyIdToken(idToken, true);
    check(
      data.email_verified && data.firebase?.sign_in_provider === "google.com",
      "Use a verified Google account",
      401,
    );
    return data;
  } catch {
    check(false, "Invalid Google sign-in. Please try again.", 401);
  }
}
module.exports = {
  issue,
  revoke,
  authenticate,
  participant,
  staff,
  admin,
  categoryAccess,
  publicActor,
  password,
  temporaryPassword,
  verifyFirebase,
  wrap,
  cookie,
  options,
  bcrypt,
};
