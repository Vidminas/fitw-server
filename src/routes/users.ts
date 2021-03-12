const debug = require("debug")("fitw-server:routes/users");
import { Request, Response, NextFunction, Router } from "express";
import User from "../models/user";

const router = Router();

// Get all users
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  debug("GET /");
  const users = await User.find().catch((error) => {
    next({ status: 500, message: error.message });
  });
  return res.json(users);
});

// Get a particular user by their username
router.get(
  "/:username",
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.params.username;
    const user = await User.findOne({ username }).catch((error) => {
      next({ status: 400, message: error.message });
    });
    if (!user) {
      next({ status: 404, message: `User ${username} not found!` });
    }
    return res.json(user);
  }
);

// Add a new user
router.post("/", async (req, res, next) => {
  const { username, publicName, groups, worlds } = req.body;
  const user = new User({ username, publicName, groups, worlds });
  await user.save().catch((error) => {
    next({ status: 400, message: error.message });
  });
  return res.send(`Created user ${username}`);
});

// Replace an existing user with provided data
router.put("/:username", async (req, res, next) => {
  const oldUsername = req.params.username;
  const { username, publicName, groups, worlds } = req.body;
  const user = new User({ username, publicName, groups, worlds });
  await User.findOneAndReplace({ oldUsername }, user).catch((error) => {
    next({ status: 400, message: error.message });
  });
  return res.send(`Replaced user ${oldUsername} with ${username}`);
});

// Delete a user
router.delete("/:username", async (req, res, next) => {
  const username = req.params.username;
  await User.deleteOne({ username }).catch((error) => {
    next({ status: 400, message: error.message });
  });
  return res.send(`Deleted user ${username}`);
});

// error handler
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.status || 500;
  const message =
    error.message ||
    "Something went wrong, please report this to the developers";
  debug(message);
  return res.status(statusCode).send(message);
});

export default router;
