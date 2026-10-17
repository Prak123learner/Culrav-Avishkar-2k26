const fs = require("node:fs/promises");
const path = require("node:path");
const mongoose = require("mongoose");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
  quiet: true,
});
const catalog = require("./catalog.json");
const { Subevent } = require("./models");

async function restore() {
  const originals = new Map();
  for (const category of catalog) {
    category.data.events.forEach((event, index) => {
      originals.set(
        `${category.festival}/${category.slug}/${index}`,
        (event.rules || []).join("\n"),
      );
    });
  }
  await mongoose.connect(process.env.MONGO);
  try {
    const events = await Subevent.find({
      fixedKey: { $in: [...originals.keys()] },
    })
      .select("fixedKey rules revision")
      .lean();
    const backupFolder = path.join(__dirname, "../../.local");
    await fs.mkdir(backupFolder, { recursive: true });
    const backupPath = path.join(
      backupFolder,
      `rules-before-restore-${Date.now()}.json`,
    );
    await fs.writeFile(backupPath, JSON.stringify(events, null, 2), {
      flag: "wx",
    });
    if (events.length) {
      const result = await Subevent.bulkWrite(
        events.map((event) => ({
          updateOne: {
            filter: { _id: event._id, revision: event.revision },
            update: {
              $set: { rules: originals.get(event.fixedKey) },
              $inc: { revision: 1 },
            },
          },
        })),
      );
      console.log(
        `Restored original static rules for ${result.modifiedCount} events. Previous rules backed up in .local.`,
      );
    } else console.log("No seeded events found; no rules changed.");
  } finally {
    await mongoose.disconnect();
  }
}
restore().catch(() => {
  console.error(
    "Could not restore rules. Check local MongoDB and server configuration.",
  );
  process.exitCode = 1;
});
