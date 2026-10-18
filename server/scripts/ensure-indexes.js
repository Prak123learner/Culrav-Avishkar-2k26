require("dotenv").config();
const mongoose = require("mongoose");
const { databaseUri } = require("../utils/connectDB");
const models = require("../portal/models");

async function ensureIndexes() {
  for (const model of Object.values(models)) {
    if (!model.schema) continue;
    // Add declared indexes only. Never drop existing indexes or delete data.
    await model.createIndexes();
    console.log(`Indexes ready: ${model.collection.name}`);
  }
}
async function run() {
  await mongoose.connect(databaseUri(), {
    autoIndex: false,
    autoCreate: false,
  });
  await ensureIndexes();
}

module.exports = { ensureIndexes };

if (require.main === module)
  run()
    .catch((error) => {
      console.error(
        `Index setup failed (${error.name}, code ${error.code || "unknown"}). Check database permissions and duplicate values before retrying.`,
      );
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
