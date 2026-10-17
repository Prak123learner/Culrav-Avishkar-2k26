require("dotenv").config();
const mongoose = require("mongoose");
const { Registration, Subevent } = require("./models");

function requireLocalMongo(uri) {
  const parsed = new URL(uri);
  const hosts = parsed.host
    .split(",")
    .map((host) => host.replace(/^.*@/, "").replace(/:\d+$/, ""));
  const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
  if (!hosts.every((host) => localHosts.has(host)))
    throw new Error("This migration is restricted to a local MongoDB URI");
}

async function run() {
  if (!process.env.MONGO) throw new Error("Set MONGO before running migration");
  requireLocalMongo(process.env.MONGO);
  await mongoose.connect(process.env.MONGO);

  const registeredEventIds = await Registration.distinct("eventId");
  const lockFilter = {
    participationLockedAt: null,
    $or: [
      { formPublished: true },
      ...(registeredEventIds.length
        ? [{ _id: { $in: registeredEventIds } }]
        : []),
    ],
  };
  const locked = await Subevent.updateMany(lockFilter, {
    $set: { participationLockedAt: new Date() },
  });
  const cleaned = await Subevent.collection.updateMany(
    {},
    {
      $unset: {
        description: "",
        rules: "",
        contact: "",
        coordinators: "",
        sourceData: "",
      },
    },
  );
  console.log(
    `Locked ${locked.modifiedCount} existing event configurations and removed duplicate static content from ${cleaned.modifiedCount} event records.`,
  );
}

run()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
