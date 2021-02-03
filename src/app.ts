import cors from "cors";
import express from "express";
import handlebars from "express-handlebars";
import passport from "passport";
import path from "path";
import { authCallbackUrl, authUrl, magicLogin } from "./auth/passport";

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
app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/user", userRouter);

// Authentication using passport and magic login
app.post(authUrl, magicLogin.send);
app.get(
  authCallbackUrl,
  passport.authenticate("magiclogin", { session: false })
);

export default app;
