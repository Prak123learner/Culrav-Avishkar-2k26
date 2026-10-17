require("dotenv").config();
const mongoose = require("mongoose");
const { Staff, Category } = require("./models");
const { temporaryPassword, bcrypt } = require("./auth");

async function run() {
  if (!process.env.MONGO || !process.env.ADMIN_EMAIL || !process.env.JWT_SECRET)
    throw new Error("Set MONGO, ADMIN_EMAIL and JWT_SECRET first");
  await mongoose.connect(process.env.MONGO);
  const {
    Participant,
    Subevent,
    FestTeam,
    Registration,
    Session,
  } = require("./models");
  await Promise.all([
    Staff.init(),
    Participant.init(),
    Category.init(),
    Subevent.init(),
    FestTeam.init(),
    Registration.init(),
    Session.init(),
  ]);
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const validator = require("validator");
  if (!validator.isEmail(email)) throw new Error("ADMIN_EMAIL must be valid");
  const existing = await Staff.findOne({ email });
  if (existing) {
    if (existing.role !== "admin")
      throw new Error(
        "This email is already a coordinator; choose a separate initial admin email",
      );
    console.log("Admin already exists. Password not changed.");
  } else {
    const password = temporaryPassword();
    const actor = await Staff.create({
      name: "Festival Admin",
      email,
      role: "admin",
      passwordHash: await bcrypt.hash(password, 12),
      temporaryPasswordExpires: new Date(Date.now() + 72 * 3600000),
    });
    console.log(
      `Admin created: ${actor.email} (${actor.caId})\nTemporary password (shown once): ${password}\nChange it on first login at /coordinator/login.`,
    );
  }
  const result = await require("./catalog-service").seedCatalog();
  console.log(
    `Fixed catalog ready: ${result.categories} categories / ${result.subevents} subevents. Existing edits and forms retained.`,
  );
}
run()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
