const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB } = require("./utils/connectDB");
require("./portal/deployment").validateProductionConfig();

const app = express();

const AppError = require("./utils/appError");

const globalErrorHandler = require("./Controller/error.controller");

app.use(helmet());
app.use(
  cors({
    origin: (process.env.FRONTEND_URL || "http://localhost:5173")
      .split(",")
      .map((s) => s.trim()),
    credentials: true,
  }),
);

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
