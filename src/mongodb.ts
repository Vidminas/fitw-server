/**
 * This file is used if the backend database is a MongoDB
 * Not in use when MySQL is used instead
 */
const debug = require("debug")("fitw-server:mongodb");
import mongoose from "mongoose";
import { logServerMessage } from "./adminHandler";

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
      logServerMessage(
        {
          username: "mongodb",
          text: "Successfully initialised MongoDB database",
        },
        debug
      );
      return m.connection.getClient();
    })
    .catch((error) => {
      connected = false;
      logServerMessage(
        {
          username: "mongodb",
          text: `Failed to initialise database because: ${
            error.message || error.toString()
          }`,
        },
        debug
      );
    });
};

const disconnectDB = () => {
  if (connected) {
    mongoose.connection.close(function () {
      logServerMessage(
        {
          username: "mongodb",
          text: "Disconnected from MongoDB on app termination",
        },
        debug
      );
      process.exit(0);
    });
  }
};

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", disconnectDB).on("SIGTERM", disconnectDB);
