import { Router } from "express";
import { queryDB } from "../mysql";

var router = Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  queryDB("SELECT * FROM USERS")
    .then((rows) => res.json(rows))
    .catch((error) => {
      throw error;
    });
});

export default router;
