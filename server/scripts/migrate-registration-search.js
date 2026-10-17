require("dotenv").config();
const mongoose = require("mongoose");
const { Registration } = require("../portal/models");
const { registrationSearchKeys } = require("../portal/registration-search");

async function run() {
  if (!process.env.MONGO)
    throw new Error("Set MONGO before running this script");
  await mongoose.connect(process.env.MONGO);
  let updated = 0;
  for await (const registration of Registration.find()
    .select("teamName participants searchKeys")
    .cursor()) {
    const searchKeys = registrationSearchKeys(registration);
    if (
      searchKeys.length === registration.searchKeys.length &&
      searchKeys.every((key, index) => key === registration.searchKeys[index])
    )
      continue;
    await Registration.updateOne(
      { _id: registration._id },
      { $set: { searchKeys } },
    );
    updated += 1;
  }
  console.log(`Updated ${updated} registration search records.`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
