const debug = require("debug")("fitw-server:routes/worlds");
import { Request, Response, NextFunction, Router } from "express";
import worldModel from "../models/world";

const router = Router();

// error handler
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.status || 500;
  const message =
    error.toString() ||
    "Something went wrong, please report this to the developers";
  debug(message);
  return res.status(statusCode).send({ statusCode, message });
});

// Get a particular world by its id (obtained from user worlds)
router.get(
  "/:worldId",
  async (req: Request, res: Response, next: NextFunction) => {
    const worldId = req.params.worldId;
    debug("GET /" + worldId);
    const world = await worldModel.findById(worldId).catch((error) => {
      next({ status: 400, ...error });
    });
    if (!world) {
      const error = new Error(`World ${worldId} not found!`);
      next({ status: 404, ...error });
    }
    return res.json(world);
  }
);

export default router;
