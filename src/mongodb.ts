/**
 * This file is used if the backend database is a MongoDB
 * Not in use when MySQL is used instead
 */
const debug = require("debug")("fitw-server:mongodb");
import mongoose from "mongoose";

let connected = false;

export const initializeDB = () => {
  return mongoose
    .connect(process.env.DATABASE_URL!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => {
      connected = true;
      debug("Successfully initialised MongoDB database");
    })
    .catch((error) => {
      connected = false;
      debug("Failed to initialise database because:");
      debug(error);
    });
};

const disconnectDB = () => {
  if (connected) {
    mongoose.connection.close(function () {
      debug("Disconnected from MongoDB on app termination");
      process.exit(0);
    });
  }
};

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", disconnectDB).on("SIGTERM", disconnectDB);

export const mongodb = mongoose.connection;
