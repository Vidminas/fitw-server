/**
 * This file is used if the backend database is a MongoDB
 * Not in use when MySQL is used instead
 */
const debug = require("debug")("fitw-server:mongodb");
import mongoose from "mongoose";

let connected = false;

export const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // CosmosDB doesn't support retryable writes
  // https://stackoverflow.com/questions/58589631/mongoerror-this-mongodb-deployment-does-not-support-retryable-writes-please-ad
  ...(process.env.NODE_ENV !== "dev" && {
    retryWrites: false,
  }),
};

export const initializeDB = () => {
  return mongoose
    .connect(process.env.DATABASE_URL!, {
      ...mongoOptions,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then((m) => {
      connected = true;
      debug("Successfully initialised MongoDB database");
      return m.connection.getClient();
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
