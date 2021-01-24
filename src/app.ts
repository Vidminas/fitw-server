import express from "express";
import path from "path";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

export default app;
