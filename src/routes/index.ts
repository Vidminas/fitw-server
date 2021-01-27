import { Router } from "express";
import { numPlayers, messages } from "../playerHandler";
const router = Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("home", { numPlayers, messages });
});

export default router;
