require("dotenv").config();
const mongoose = require("mongoose");
const {
  Participant,
  Staff,
  Category,
  Subevent,
  FestTeam,
  Registration,
  Audit,
  Session,
} = require("../portal/models");
const { seedCatalog } = require("../portal/catalog-service");

const CONFIRMATION = "RESET-FESTIVAL-DATA";

function requireExplicitConfirmation() {
  const confirmation = process.argv.find((argument) =>
    argument.startsWith("--confirm="),
  );
  if (confirmation !== `--confirm=${CONFIRMATION}`) {
    throw new Error(
      `Reset cancelled. Run with --confirm=${CONFIRMATION} after checking the database and backup.`,
    );
  }
}

function requireLocalDevelopmentDatabase(uri) {
  if (process.env.NODE_ENV === "production")
    throw new Error("Reset is disabled when NODE_ENV=production");
  const parsed = new URL(uri);
  const hosts = parsed.host
    .split(",")
    .map((host) => host.replace(/^.*@/, "").replace(/:\d+$/, ""));
  const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
  if (!hosts.length || !hosts.every((host) => localHosts.has(host)))
    throw new Error("Reset is restricted to a local MongoDB database");
}

async function resetFestivalData() {
  requireExplicitConfirmation();
  if (!process.env.MONGO) throw new Error("Set MONGO before running reset");
  if (!process.env.ADMIN_EMAIL)
    throw new Error("Set ADMIN_EMAIL to the admin account that must be kept");
  requireLocalDevelopmentDatabase(process.env.MONGO);

  await mongoose.connect(process.env.MONGO);
  const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const admin = await Staff.findOne({ email: adminEmail, role: "admin" })
    .select("+passwordHash")
    .lean();
  if (!admin)
    throw new Error(`Admin ${adminEmail} was not found. Nothing was deleted.`);
  const suffix = admin.caId?.match(/^CA-\d{4}-(\d{6})$/)?.[1];
  if (!suffix)
    throw new Error(
      "The retained admin has an invalid CA ID. Nothing was deleted.",
    );

  const [participants, teams, registrations, audits, sessions, otherStaff] =
    await Promise.all([
      // Deletes every participant account, profile and issued participant CA ID.
      Participant.deleteMany({}),
      // Deletes all reusable teams, memberships and pending invitations.
      FestTeam.deleteMany({}),
      // Deletes every solo/team registration, submitted answer and answer history.
      Registration.deleteMany({}),
      // Deletes the complete staff audit-log history.
      Audit.deleteMany({}),
      // Deletes every participant and staff login session, including the admin's.
      Session.deleteMany({}),
      // Deletes coordinators and any additional staff, while preserving this admin.
      Staff.deleteMany({ _id: { $ne: admin._id } }),
    ]);

  await Promise.all([
    // Deletes dynamic event settings, form questions, deadlines and publication state.
    Subevent.deleteMany({}),
    // Deletes the MongoDB category records that the dynamic events reference.
    Category.deleteMany({}),
  ]);

  // Releases random CA ID suffixes owned by deleted accounts; keeps the admin suffix.
  await mongoose.connection.collection("caidcodes").deleteMany({
    _id: { $ne: suffix },
  });

  // Clears old category references and invalidates any copied admin session token.
  await Staff.updateOne(
    { _id: admin._id },
    { $set: { categoryIds: [] }, $inc: { sessionVersion: 1 } },
  );

  // Recreates the 20 fixed categories and 116 events with empty unpublished forms.
  const catalog = await seedCatalog();

  console.log(
    [
      `Reset complete for local database ${mongoose.connection.name}.`,
      `Retained admin: ${admin.email} (${admin.caId}).`,
      `Deleted participants: ${participants.deletedCount}.`,
      `Deleted teams: ${teams.deletedCount}.`,
      `Deleted registrations: ${registrations.deletedCount}.`,
      `Deleted audit records: ${audits.deletedCount}.`,
      `Deleted sessions: ${sessions.deletedCount}.`,
      `Deleted other staff accounts: ${otherStaff.deletedCount}.`,
      `Recreated ${catalog.categories} categories and ${catalog.subevents} empty-form events.`,
    ].join("\n"),
  );
}

resetFestivalData()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
