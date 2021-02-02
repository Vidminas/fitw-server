import cors from "cors";
import express from "express";
import handlebars from "express-handlebars";
import path from "path";

import indexRouter from "./routes/index";
import userRouter from "./routes/user";

const app = express();

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.engine(
  "hbs",
  handlebars({
    layoutsDir: path.join(__dirname, "layouts"),
    extname: "hbs",
    defaultLayout: "main",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, "..", "public")));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use("/", indexRouter);
app.use("/user", userRouter);

export default app;
