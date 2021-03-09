import { Router } from "express";
import { livePlayers, liveWorlds, messages } from "../playerHandler";
const router = Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("home", {
    numLivePlayers: livePlayers.size,
    numLiveWorlds: liveWorlds.size,
    messages,
  });
});

export default router;
