import cors from "cors";
import express from "express";
import handlebars from "express-handlebars";
import session from "express-session";
import passport from "passport";
import path from "path";
import MongoStore from "connect-mongo";
import {
  loginUrl,
  authUrl,
  magicLogin,
  authenticateToken,
  authenticateUser,
} from "./auth/passport";
import { mongoOptions } from "./mongodb";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import worldsRouter from "./routes/worlds";

const app = express();

// Only parse query parameters into strings, not objects
app.set("query parser", "simple");

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
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
      mongoOptions,
      touchAfter: 24 * 3600, // refresh unmodified sessions once in 24h
      crypto: {
        secret: process.env.MONGO_SESSION_SECRET!,
      },
      // enable compatibility mode for TTL to support CosmosDB
      // https://stackoverflow.com/questions/59638751/the-expireafterseconds-option-is-supported-on-ts-field-only-error-is-s
      ...(process.env.NODE_ENV !== "dev" && {
        ttl: 24 * 60 * 60 * 1000,
        autoRemove: "interval",
        autoRemoveInterval: 10, // Value in minutes (default is 10)
      }),
    }),
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
app.use("/worlds", worldsRouter);

// Authentication using passport and magic login
app.post(authUrl, magicLogin.send);
app.get(loginUrl, authenticateToken);
app.post(loginUrl, authenticateUser);

export default app;
