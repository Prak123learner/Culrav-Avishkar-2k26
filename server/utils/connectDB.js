const mongoose = require("mongoose");
let connectionPromise;

function databaseUri() {
  const template = process.env.MONGO || process.env.DATABASE;
  if (!template) throw new Error("Set MONGO or DATABASE in the environment");
  return template.replace(
    "<db_password>",
    encodeURIComponent(process.env.DATABASE_PASSWORD || ""),
  );
}

function poolSize() {
  const value = Number(process.env.MONGO_MAX_POOL_SIZE || 10);
  if (!Number.isInteger(value) || value < 1 || value > 100)
    throw new Error("MONGO_MAX_POOL_SIZE must be an integer from 1 to 100");
  return value;
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (mongoose.connection.readyState === 0) connectionPromise = undefined;
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(databaseUri(), {
        // A Vercel deployment can create several isolated instances. Keep each
        // instance's pool intentionally small instead of accepting Mongoose's
        // much larger default pool.
        maxPoolSize: poolSize(),
        minPoolSize: 0,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 10000,
      })
      .then(async (connection) => {
        const {
          Participant,
          Staff,
          Category,
          Subevent,
          FestTeam,
          Registration,
          Session,
        } = require("../portal/models");
        await Promise.all(
          [
            Participant,
            Staff,
            Category,
            Subevent,
            FestTeam,
            Registration,
            Session,
          ].map((model) => model.init()),
        );
        return connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }
  return connectionPromise;
}

module.exports = { connectDB };
