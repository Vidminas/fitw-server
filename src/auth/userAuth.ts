const debug = require("debug")("fitw-server:auth");
import bcrypt from "bcrypt";
import User from "../models/user";

export const verifyUserEmail = async (email: string) => {
  // Don't load all users in memory at once, process one-by-one
  const cursor = User.find().cursor();
  for (
    let user = await cursor.next();
    user != null;
    user = await cursor.next()
  ) {
    const match = bcrypt.compareSync(email, user.emailHash);
    if (match) {
      return user;
    }
  }
  return null;
};

export const verifyUserId = (userId: any) => {
  return User.findById(userId);
};

export const createUser = async (email: string, username: string) => {
  const user = await verifyUserEmail(email);
  if (user) {
    throw new Error(`User with this email address already exists!`);
  }

  const salt = bcrypt.genSaltSync();
  const emailHash = bcrypt.hashSync(email, salt);
  const newUser = new User({ emailHash, username });
  return await newUser.save();
};
