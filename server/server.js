const dotenv = require("dotenv");
dotenv.config({
  path: "./.env",
});
require("./portal/deployment").validateProductionConfig();

const mongoose = require("mongoose");
//////////////////////////////////////////////
////// catching uncaught exception
process.on("uncaughtException", (err) => {
  console.log("uncaught exception .......... shutiing down 💣💣💣💣💣💣");
  console.log(err);
  process.exit(1);
});

const app = require("./app");
const { connectDB } = require("./utils/connectDB");

//created a serverr
const port = process.env.PORT || 3000;
let server;
connectDB().then(() => {
  server = app.listen(port, process.env.HOST || "127.0.0.1", () => {
    console.log(`App is running on a server ${port} ....`);
  });
});

// handling the unhandled error rejection

process.on("unhandledRejection", (err) => {
  // console.log(err.name, err.message);
  console.log("unhandlled rejection .......... shutiing down 💣💣💣💣💣💣");
  console.log(err);
  server?.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log("uncaughcdt exception .......... shutiing down 💣💣💣💣💣💣");
  console.log(err);
  server?.close(() => {
    process.exit(1);
  });
});
