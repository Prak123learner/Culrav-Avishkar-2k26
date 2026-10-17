const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const { connectDB } = require("./utils/connectDB");
require("./portal/deployment").validateProductionConfig();

const app = express();

const AppError = require("./utils/appError");

const globalErrorHandler = require("./Controller/error.controller");

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
);
app.use(
  cors({
    origin: (process.env.FRONTEND_URL || "http://localhost:5173")
      .split(",")
      .map((s) => s.trim()),
    credentials: true,
  }),
);

// Health check endpoint for deployment verification and uptime monitoring
app.get(["/health", "/api/v1/health"], async (req, res) => {
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  let dbStatus = dbStates[mongoose.connection.readyState] || "unknown";

  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
      dbStatus = dbStates[mongoose.connection.readyState] || "unknown";
    } catch (err) {
      dbStatus = `error: ${err.message || "connection failed"}`;
    }
  }

  const isHealthy = mongoose.connection.readyState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Vercel invokes this exported Express app directly; it never executes
// server.js or app.listen(). The promise is shared by warm function requests.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// login into developer mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// body parser , reading data from body into req.body

app.use(express.json({ limit: "256kb" })); // Allows coordinator form definitions, not file uploads.
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

app.use("/api/v1/portal", require("./portal/router"));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.all(/.*/, (req, res, next) => {
  next(
    new AppError(
      `can't find the ${req.originalUrl}`,
      404,
      "RESOURCE_NOT_FOUND",
    ),
  );
});

app.use(globalErrorHandler);

module.exports = app;
