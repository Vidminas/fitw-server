import { Router } from "express";
const router = Router();

let numPlayers: number = 0;

export const addPlayer = () => {
  numPlayers++;
};

export const removePlayer = () => {
  numPlayers--;
};

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("home", { players: numPlayers });
});

export default router;
