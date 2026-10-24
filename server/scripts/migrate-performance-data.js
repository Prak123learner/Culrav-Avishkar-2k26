require("dotenv").config();
const mongoose = require("mongoose");
const { databaseUri } = require("../utils/connectDB");
const { Participant, Staff, Registration } = require("../portal/models");
const { ensureIndexes } = require("./ensure-indexes");

const BATCH_SIZE = 500;

function caIdFields(caId) {
  const suffix = String(caId || "").match(/^CA-\d{4}-(\d{6})$/)?.[1];
  if (!suffix) return null;
  return {
    suffix,
    reversed: [...suffix].reverse().join(""),
  };
}

async function flushAccounts(Model, operations, codes) {
  if (!operations.length && !codes.size) return 0;
  const count = operations.length;
  if (operations.length) await Model.bulkWrite(operations, { ordered: false });
  if (codes.size)
    await mongoose.connection.collection("caidcodes").bulkWrite(
      [...codes].map((suffix) => ({
        updateOne: {
          filter: { _id: suffix },
          update: { $setOnInsert: { _id: suffix } },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  operations.length = 0;
  codes.clear();
  return count;
}

async function migrateAccounts(Model) {
  const operations = [];
  const codes = new Set();
  let updated = 0;
  const cursor = Model.find({})
    .select("caId +caIdSuffix +caIdSuffixReversed")
    .lean()
    .cursor();
  for await (const account of cursor) {
    const fields = caIdFields(account.caId);
    if (!fields)
      throw new Error(
        `Invalid CA ID on account ${account._id}: ${account.caId}`,
      );
    if (
      account.caIdSuffix !== fields.suffix ||
      account.caIdSuffixReversed !== fields.reversed
    )
      operations.push({
        updateOne: {
          filter: { _id: account._id },
          update: {
            $set: {
              caIdSuffix: fields.suffix,
              caIdSuffixReversed: fields.reversed,
            },
          },
        },
      });
    codes.add(fields.suffix);
    if (operations.length >= BATCH_SIZE || codes.size >= BATCH_SIZE)
      updated += await flushAccounts(Model, operations, codes);
  }
  updated += await flushAccounts(Model, operations, codes);
  return updated;
}

async function migrateRegistrationLeaders() {
  let updated = 0;
  const cursor = Registration.find({
    teamId: { $ne: null },
    $or: [
      { leaderCaId: { $exists: false } },
      { leaderCaId: null },
      { leaderCaId: "" },
    ],
  })
    .select("submittedBy")
    .lean()
    .cursor();
  let registrations = [];
  async function flush() {
    if (!registrations.length) return;
    const leaderIds = [
      ...new Set(registrations.map((item) => String(item.submittedBy))),
    ];
    const leaders = await Participant.find({ _id: { $in: leaderIds } })
      .select("caId")
      .lean();
    const caIds = new Map(
      leaders.map((leader) => [String(leader._id), leader.caId]),
    );
    const operations = registrations
      .map((registration) => ({
        id: registration._id,
        caId: caIds.get(String(registration.submittedBy)),
      }))
      .filter((item) => item.caId)
      .map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: { leaderCaId: item.caId } },
        },
      }));
    if (operations.length) {
      await Registration.bulkWrite(operations, { ordered: false });
      updated += operations.length;
    }
    registrations = [];
  }
  for await (const registration of cursor) {
    registrations.push(registration);
    if (registrations.length >= BATCH_SIZE) await flush();
  }
  await flush();
  return updated;
}

async function run() {
  await mongoose.connect(databaseUri(), {
    autoIndex: false,
    autoCreate: false,
  });
  const participants = await migrateAccounts(Participant);
  const staff = await migrateAccounts(Staff);
  const registrations = await migrateRegistrationLeaders();
  await ensureIndexes();
  console.log(
    `Performance data ready: ${participants} participants, ${staff} staff accounts, and ${registrations} legacy registrations updated.`,
  );
}

if (require.main === module)
  run()
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());

module.exports = { run, caIdFields };
