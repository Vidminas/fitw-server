import { Router } from "express";
import { livePlayers, liveWorlds } from "../playerHandler";
import { serverLogMessages } from "../adminHandler";
import * as events from "../serverEvents";
import { getToday } from "../time";

const router = Router();

/* GET the admin panel page. */
router.get("/", (req, res, next) => {
  res.render("fitwick", {
    numLivePlayers: livePlayers.size,
    numLiveWorlds: liveWorlds.size,
    today: getToday().toLocaleDateString(),
    serverLogMessages,
    events,
  });
});

router.get("/:command", (req, res, next) => {
  const command = req.params.command;
  switch (command) {
    case "logs":
      return res.json(serverLogMessages);
    default:
      return res.status(400).send("Unknown command!");
  }
});

export default router;
