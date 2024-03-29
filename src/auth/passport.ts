const debug = require("debug")("fitw-server:auth");
import { readFileSync } from "fs";
import passport from "passport";
import MagicLoginStrategy from "passport-magic-login";
import sgMail from "@sendgrid/mail";
import { verifyUserId, verifyUserEmail } from "./userAuth";
import userModel, { IUserDocument } from "../models/user";
import { Schema } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { logServerMessage } from "../adminHandler";

const fitwEmailBanner = readFileSync("./public/FITW email banner.png").toString(
  "base64"
);
const bannerCID = "bannerImage";
const bannerAttachment = {
  filename: "FITW email banner.png",
  type: "image/png",
  content_id: bannerCID,
  content: fitwEmailBanner,
  disposition: "inline",
};

export const authUrl = "/auth";
export const loginUrl = "/login";

export const magicLogin = new MagicLoginStrategy({
  secret: process.env.MAGIC_LINK_SECRET!,
  callbackUrl: loginUrl,
  sendMagicLink: (destination, confirmUrl, verificationCode) => {
    return sgMail
      .send({
        to: destination,
        attachments: [bannerAttachment],
        from: process.env.SENDGRID_SENDER!,
        subject: "Fill In The World sign in",
        html: `<h1>Fill In The World</h1>
        <p>To complete your sign in to Fill In The World, please ensure the verification code below is displayed</p>
        <h2>${verificationCode}</h2>
        <p>and then click the image below:</p>
        <a href="${process.env.CLIENT_URL}${confirmUrl}">
        <img src="cid:${bannerCID}" alt="Fill In The World banner" />
        </a>
        <p>Alternatively, if the image does not work, you can use this link instead:</p>
        <a href="${process.env.CLIENT_URL}${confirmUrl}">${process.env.CLIENT_URL}${confirmUrl}</a>`,
      })
      .then((clientResponse) =>
        logServerMessage(
          {
            username: "magic link auth",
            text: `Sent magic link and got "${clientResponse[0]}"`,
          },
          debug
        )
      )
      .catch((error) =>
        logServerMessage(
          {
            username: "magic link auth",
            text: `Error sending magic link: ${error}`,
          },
          debug
        )
      );
  },
  verify: (payload, done) => {
    logServerMessage(
      {
        username: "magic link auth",
        text: "Verifying new user login",
      },
      debug
    );

    if (!payload.destination) {
      logServerMessage(
        {
          username: "magic link auth",
          text:
            "But the supplied POST data is invalid - link wrong or expired!",
        },
        debug
      );
      return done(undefined, false, {
        message: "Authentication link wrong or expired",
      });
    }

    verifyUserEmail(payload.destination)
      .then((user) => {
        if (!user) {
          logServerMessage(
            {
              username: "magic link auth",
              text: "User email address not registered!",
            },
            debug
          );
          return done(undefined, false, {
            message: "Email address not registered",
          });
        } else {
          logServerMessage(
            {
              username: "magic link auth",
              text: `Successfully validated user ${user.username}`,
            },
            debug
          );
          return done(undefined, user);
        }
      })
      .catch((error) => {
        logServerMessage(
          {
            username: "magic link auth",
            text: error.message || error.toString(),
          },
          debug
        );
        done(error);
      });
  },
});

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
passport.use(magicLogin);

passport.serializeUser<Schema.Types.ObjectId>((user, done) => {
  done(null, (user as IUserDocument).id);
});

passport.deserializeUser<Schema.Types.ObjectId>((id, done) => {
  userModel.findById(id, (error: any, user: IUserDocument) => {
    done(error, user);
  });
});

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "magiclogin",
    (error: any, user: IUserDocument, info: any) => {
      if (error) {
        return res.status(401).json({ error: error });
      }
      if (!user) {
        return res.status(401).json({ error: info });
      }
      return res.status(200).json({ id: user.id });
    }
  )(req, res, next);
};

export const authenticateUser = (req: Request, res: Response) => {
  if (!req.body.id) {
    logServerMessage(
      {
        username: "local user auth",
        text: `Received invalid locally cached user request with body: ${JSON.stringify(
          req.body
        )}`,
      },
      debug
    );
    res.status(400).json({
      error: {
        message:
          "Invalid locally cached user request. Try re-sending a new authentication email.",
      },
    });
    return;
  }

  logServerMessage(
    {
      username: "local user auth",
      text: `Verifying locally cached user with ID ${req.body.id}`,
    },
    debug
  );
  verifyUserId(req.body.id)
    .then((dbUser) => {
      if (dbUser) {
        logServerMessage(
          {
            username: "local user auth",
            text: `Successfully validated user ${dbUser.username}`,
          },
          debug
        );
        res.status(200).json(dbUser);
      } else {
        logServerMessage(
          {
            username: "local user auth",
            text: "No such user found in server database!",
          },
          debug
        );
        res.status(401).json({
          error: { message: "No such user found in server database!" },
        });
      }
    })
    .catch((error) => {
      logServerMessage(
        {
          username: "local user auth",
          text: error.message || error.toString(),
        },
        debug
      );
      res.status(401).json({ error: error });
    });
};
