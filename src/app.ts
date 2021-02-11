import cors from "cors";
import express from "express";
import handlebars from "express-handlebars";
import session from "express-session";
import passport from "passport";
import path from "path";
import {
  loginUrl,
  authUrl,
  magicLogin,
  authenticateToken,
  authenticateUser,
} from "./auth/passport";
import { mongodb } from "./mongodb";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";

const app = express();
const MongoStore = require("connect-mongo")(session);
const sessionStore = new MongoStore({
  mongooseConnection: mongodb,
  touchAfter: 24 * 3600, // refresh unmodified sessions once in 24h
  secret: process.env.MONGO_SESSION_SECRET,
});

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
app.use(
  session({
    cookie: {
      secure: process.env.NODE_ENV !== "dev",
      path: "/",
    },
    secret: process.env.SESSION_SECRET!,
    saveUninitialized: false,
    resave: false,
    store: sessionStore,
  })
);
// app.use(express.static(path.join(__dirname, "..", "public")));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/users", usersRouter);

// Authentication using passport and magic login
app.post(authUrl, magicLogin.send);
app.get(loginUrl, authenticateToken);
app.post(loginUrl, authenticateUser);

export default app;
