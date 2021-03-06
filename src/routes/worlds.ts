const debug = require("debug")("fitw-server:routes/worlds");
import { Request, Response, NextFunction, Router } from "express";
import worldModel from "../models/world";

const router = Router();

// Get all worlds (or a collection of some with the query param ?id=1,2,3)
// see https://stackoverflow.com/questions/9371195/rest-api-requesting-multiple-resources-in-a-single-get
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const worldIDs = req.query.id;
  debug("GET /" + (worldIDs ? "?id=" + worldIDs : ""));
  try {
    if (!worldIDs) {
      return res.json(await worldModel.find());
    }

    const worldIdArr = (worldIDs as string).split(",");
    return res.json(
      await worldModel.find({
        _id: {
          $in: worldIdArr,
        },
      })
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
    debug("GET /" + worldId);
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
    debug(`DELETE /${worldId}`);
    next({ status: 500, message: "World deletion is not implemented yet!" });
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
  debug(message);
  return res.status(statusCode).send(message);
});

export default router;
