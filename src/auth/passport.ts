const debug = require("debug")("fitw-server:auth");
import { readFileSync } from "fs";
import passport from "passport";
import MagicLoginStrategy from "passport-magic-login";
import sgMail from "@sendgrid/mail";
import { verifyUser } from "./userAuth";

const fitwEmailBanner = readFileSync("./public/FITW email banner.png").toString(
  "base64"
);

export const authUrl = "/auth";
export const authCallbackUrl = "/auth/callback";

export const magicLogin = new MagicLoginStrategy({
  secret: process.env.MAGIC_LINK_SECRET!,
  callbackUrl: authCallbackUrl,
  sendMagicLink: (destination, confirmUrl) => {
    return sgMail
      .send({
        to: destination,
        from: process.env.SENDGRID_SENDER!,
        subject: "Fill In The World sign in",
        html: `<p>Click the image below to sign in to Fill In The World:</p>
        <a href="${process.env.HOST_URL}${confirmUrl}">
        <img src="data:image/png;base64,${fitwEmailBanner}" alt="Fill In The World banner" />
        </a>
        <p>Alternatively, if the image does not work, you can use this link instead:</p>
        <a href="${process.env.HOST_URL}${confirmUrl}">${process.env.HOST_URL}${confirmUrl}</a>`,
      })
      .then((clientResponse) =>
        debug(`Sent magic link and got "${clientResponse}"`)
      )
      .catch((error) => debug(`Error sending magic link: ${error}`));
  },
  verify: (payload, done) => {
    debug("Verifying new user login");
    verifyUser(payload.destination)
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
