const mongoose = require("mongoose");
const { check } = require("./validation");
// Registration writes touch event, team, and registration documents. They must
// commit together or fail closed; a standalone server cannot provide this.
let topologyClient, topology;
async function registrationWrite(work) {
  const client = mongoose.connection.getClient();
  if (topologyClient !== client) {
    topologyClient = client;
    topology = mongoose.connection.db.admin().command({ hello: 1 });
  }
  const hello = await topology;
  check(
    hello.setName || hello.msg === "isdbgrid",
    "Registrations require MongoDB replica-set transactions",
    503,
  );
  return mongoose.connection.transaction(work);
}
module.exports = { registrationWrite };
