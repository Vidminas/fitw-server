const debug = require("debug")("fitw-server:routes/users");
import { Request, Response, NextFunction, Router } from "express";
import { logServerMessage } from "../adminHandler";
import User from "../models/user";

const router = Router();

// Get all users
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  logServerMessage(
    {
      username: "routes/users",
      text: "GET /",
    },
    debug
  );
  const users = await User.find().catch((error) => {
    return next({ status: 500, message: error.message });
  });
  return res.json(users);
});

// Get a particular user by their username
router.get(
  "/:username",
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.params.username;
    logServerMessage(
      {
        username: "routes/users",
        text: `GET /${username}`,
      },
      debug
    );

    const user = await User.findOne({ username }).catch((error) => {
      return next({ status: 400, message: error.message });
    });

    if (!user) {
      return next({ status: 404, message: `User ${username} not found!` });
    }

    logServerMessage(
      {
        username: "routes/users",
        text: `Found user ${user.username}`,
      },
      debug
    );
    return res.json(user);
  }
);

// Add a new user
// TODO: This route is out-of-date, it needs to require a user email
// router.post("/", async (req, res, next) => {
//   const { username, groups, worlds } = req.body;
//   const user = new User({ username, groups, worlds });
//   await user.save().catch((error) => {
//     next({ status: 400, message: error.message });
//   });
//   return res.send(`Created user ${username}`);
// });

// Replace an existing user with provided data
// TODO: This route is out-of-date, it needs to require a user email
// router.put("/:username", async (req, res, next) => {
//   const oldUsername = req.params.username;
//   const { username, groups, worlds } = req.body;
//   const user = new User({ username, groups, worlds });
//   await User.findOneAndReplace({ oldUsername }, user).catch((error) => {
//     next({ status: 400, message: error.message });
//   });
//   return res.send(`Replaced user ${oldUsername} with ${username}`);
// });

// Delete a user
// router.delete("/:username", async (req, res, next) => {
//   const username = req.params.username;
//   await User.deleteOne({ username }).catch((error) => {
//     next({ status: 400, message: error.message });
//   });
//   return res.send(`Deleted user ${username}`);
// });

// error handler
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.status || 500;
  const message =
    error.message ||
    "Something went wrong, please report this to the developers";
  logServerMessage(
    {
      username: "routes/users",
      text: message,
    },
    debug
  );
  return res.status(statusCode).send(message);
});

export default router;
