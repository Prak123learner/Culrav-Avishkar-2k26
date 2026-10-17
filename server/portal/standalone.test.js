const { test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { registrationWrite } = require("./database");

test("registration writes fail closed on standalone MongoDB", async () => {
  const mongo = await MongoMemoryServer.create({
    binary: { version: process.env.MONGOMS_VERSION || "7.0.14" },
  });
  try {
    await mongoose.connect(mongo.getUri());
    let invoked = false;
    await assert.rejects(
      registrationWrite(async () => {
        invoked = true;
      }),
      (error) => error.statusCode === 503,
    );
    assert.equal(invoked, false);
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
  }
});
