const debug = require("debug")("fitw-server:auth");
import { readFileSync } from "fs";
import passport from "passport";
import MagicLoginStrategy from "passport-magic-login";
import sgMail from "@sendgrid/mail";
import { verifyUserId, verifyUserEmail } from "./userAuth";
import userModel, { IUser } from "../models/user";
import { Schema } from "mongoose";
import { Request, Response, NextFunction } from "express";

const fitwEmailBanner = readFileSync("./public/FITW email banner.png").toString(
  "base64"
);

export const authUrl = "/auth";
export const loginUrl = "/login";

export const magicLogin = new MagicLoginStrategy({
  secret: process.env.MAGIC_LINK_SECRET!,
  callbackUrl: loginUrl,
  sendMagicLink: (destination, confirmUrl, verificationCode) => {
    return sgMail
      .send({
        to: destination,
        from: process.env.SENDGRID_SENDER!,
        subject: "Fill In The World sign in",
        html: `<h1>Fill In The World</h1>
        <p>To complete your sign in to Fill In The World, please ensure the verification code below is displayed</p>
        <h2>${verificationCode}</h2>
        <p>and then click the image below:</p>
        <a href="${process.env.CLIENT_URL}${confirmUrl}">
        <img src="data:image/png;base64,${fitwEmailBanner}" alt="Fill In The World banner" />
        </a>
        <p>Alternatively, if the image does not work, you can use this link instead:</p>
        <a href="${process.env.CLIENT_URL}${confirmUrl}">${process.env.CLIENT_URL}${confirmUrl}</a>`,
      })
      .then((clientResponse) =>
        debug(`Sent magic link and got "${clientResponse}"`)
      )
      .catch((error) => debug(`Error sending magic link: ${error}`));
  },
  verify: (payload, done) => {
    debug("Verifying new user login");
    if (!payload.destination) {
      debug("But the supplied POST data is invalid - link expired!");
      return done(undefined, false, { message: "Authentication link expired" });
    }

    verifyUserEmail(payload.destination)
      .then((user) => {
        if (!user) {
          debug("No such registered user found!");
          return done(undefined, false, {
            message: "Email address not registered",
          });
        }
        debug(`Successfully validated user ${user.username}`);
        return done(undefined, user);
      })
      .catch((error) => {
        debug(error);
        done(error);
      });
  },
});

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
passport.use(magicLogin);

passport.serializeUser<Schema.Types.ObjectId>((user, done) => {
  done(null, (user as IUser).id);
});

passport.deserializeUser<Schema.Types.ObjectId>((id, done) => {
  userModel.findById(id, (error: any, user: IUser) => {
    done(error, user);
  });
});

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("magiclogin", (error: any, user: IUser, info: any) => {
    if (error) {
      return res.status(401).json({ error: error.toString() });
    }
    if (!user) {
      return res.status(401).json(info);
    }
    return res.status(202).json({ userId: user.id });
  })(req, res, next);
};

export const authenticateUser = (req: Request, res: Response) => {
  debug(`Verifying locally cached user with ID ${req.body.data.userId}`);
  verifyUserId(req.body.data.userId)
    .then((dbUser) => {
      if (dbUser) {
        debug(`Successfully validated user ${dbUser.username}`);
        res.status(202).json(dbUser);
      } else {
        res
          .status(401)
          .json({ error: "No such user found in server database!" });
      }
    })
    .catch((error) => {
      res.status(401).json({ error: error });
    });
};
