const mongoose = require("mongoose");
exports.connectDB = async () => {
  try {
    // Safely replace password placeholder with encoded password
    const template = process.env.MONGO || process.env.DATABASE;
    if (!template) throw new Error("Set MONGO or DATABASE in server/.env");
    const DB = template.replace(
      "<db_password>",
      encodeURIComponent(process.env.DATABASE_PASSWORD),
    );

    await mongoose.connect(DB);
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

    console.log("✅ MongoDB connection established successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit process if DB connection fails
  }
};
