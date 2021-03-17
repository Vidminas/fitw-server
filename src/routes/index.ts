import { Router } from "express";
import { livePlayers, liveWorlds } from "../playerHandler";
import { serverLogMessages } from "../adminHandler";
import * as events from "../serverEvents";
import { getToday } from "../time";

const router = Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("home", {
    numLivePlayers: livePlayers.size,
    numLiveWorlds: liveWorlds.size,
    today: getToday().toLocaleDateString(),
    serverLogMessages,
    events,
  });
});

export default router;
