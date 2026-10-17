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
const { bcrypt, temporaryPassword } = require("../portal/auth");
const { seedCatalog } = require("../portal/catalog-service");

const ADMIN_EMAIL = "culrav@mnnit.ac.in";
const CONFIRMATION = "CREATE-FRESH-FESTIVAL-DATABASE";

function argument(name) {
  return process.argv
    .find((value) => value.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function connectionUriForDatabase(uri, database) {
  const parsed = new URL(uri);
  parsed.pathname = `/${database}`;
  return parsed.toString();
}

function requireSafeInput() {
  if (!process.env.MONGO)
    throw new Error("Set MONGO before running this script");
  const database = argument("--database");
  if (!/^[A-Za-z0-9_-]{1,63}$/.test(database || ""))
    throw new Error(
      "Pass a new database name using --database=culrav_avishkar_2027",
    );
  if (argument("--confirm") !== CONFIRMATION)
    throw new Error(
      `Creation cancelled. Run with --confirm=${CONFIRMATION} after checking the target database name.`,
    );
  return database;
}

async function assertDatabaseIsEmpty() {
  const collections = await mongoose.connection.db.listCollections().toArray();
  if (collections.length)
    throw new Error(
      `Database ${mongoose.connection.name} is not empty. Refusing to overwrite it.`,
    );
}

async function initialize() {
  const database = requireSafeInput();
  const uri = connectionUriForDatabase(process.env.MONGO, database);
  await mongoose.connect(uri);
  await assertDatabaseIsEmpty();

  // Create indexes before the first accounts and registration data are written.
  await Promise.all(
    [
      Participant,
      Staff,
      Category,
      Subevent,
      FestTeam,
      Registration,
      Audit,
      Session,
    ].map((model) => model.init()),
  );

  const password = temporaryPassword();
  const admin = await Staff.create({
    name: "Festival Admin",
    email: ADMIN_EMAIL,
    role: "admin",
    passwordHash: await bcrypt.hash(password, 12),
    temporaryPasswordExpires: new Date(Date.now() + 72 * 60 * 60 * 1000),
  });
  const catalog = await seedCatalog();

  console.log(
    [
      `Fresh festival database created: ${mongoose.connection.name}.`,
      `Admin: ${admin.email} (${admin.caId}).`,
      `Temporary password (shown once): ${password}`,
      `Seeded ${catalog.categories} categories and ${catalog.subevents} empty-form events.`,
    ].join("\n"),
  );
}

initialize()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
