const debug = require("debug")("fitw-server:routes/worlds");
import { Request, Response, NextFunction, Router } from "express";
import { logServerMessage } from "../adminHandler";
import worldModel from "../models/world";

const router = Router();

// Get all worlds (or a collection of some with the query param ?id=1,2,3)
// see https://stackoverflow.com/questions/9371195/rest-api-requesting-multiple-resources-in-a-single-get
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const worldIDs = req.query.id;
  logServerMessage(
    {
      username: "routes/worlds",
      text: `GET /${worldIDs ? "?id=" + worldIDs : ""}`,
    },
    debug
  );
  try {
    if (!worldIDs) {
      return res.json(await worldModel.find().select("-fitwicks"));
    }

    const worldIdArr = (worldIDs as string).split(",");
    return res.json(
      await worldModel
        .find({
          _id: {
            $in: worldIdArr,
          },
        })
        .select("-fitwicks")
    );
  } catch (error) {
    next(error);
  }
});

// Get a particular world by its id
router.get(
  "/:worldId",
  async (req: Request, res: Response, next: NextFunction) => {
    const worldId = req.params.worldId;
    logServerMessage(
      {
        username: "routes/worlds",
        text: `GET /${worldId}`,
      },
      debug
    );
    try {
      const world = await worldModel.findById(worldId);
      if (world) {
        return res.json(world);
      }
      next({ status: 404, message: `World ${worldId} not found!` });
    } catch (error) {
      next({ status: 400, message: error.message });
    }
  }
);

router.delete(
  "/:worldId",
  async (req: Request, res: Response, next: NextFunction) => {
    const worldId = req.params.worldId;
    logServerMessage(
      {
        username: "routes/worlds",
        text: `DELETE /${worldId}`,
      },
      debug
    );
    return next({
      status: 500,
      message: "World deletion is not implemented yet!",
    });
  }
);

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
      username: "routes/worlds",
      text: message,
    },
    debug
  );
  return res.status(statusCode).send(message);
});

export default router;
