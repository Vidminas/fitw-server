/**
 * This file is used if the backend database is a MongoDB
 * Not in use when MySQL is used instead
 */
const debug = require("debug")("fitw-server:mongodb");
import mongoose from "mongoose";

import User from "./models/user";
import World from "./models/world";

export const initializeDB = () => {
  return mongoose
    .connect(process.env.DATABASE_URL!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => {
      debug("Successfully initialised MongoDB database");
    })
    .catch((error) => {
      debug("Failed to initialise database because:");
      debug(error);
    });
};

const models = { User, World };
export default models;
