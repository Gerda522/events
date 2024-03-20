// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import { AuthorizationError } from "remix-auth";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator(sessionStorage, {
  sessionErrorKey: "sessionErrorKey", // keep in sync
});

async function verifyUser({ mail, password }) {
  const user = await mongoose.models.User.findOne({ mail }).select("+password");
  if (!user) {
    throw new AuthorizationError("No user found with this email.");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AuthorizationError("Invalid password.");
  }
  // Remove the password from the user object before returning it
  user.password = undefined;
  return user;
}

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let mail = form.get("mail");
    let password = form.get("password");

    // verify the user
    const user = await verifyUser({ mail, password });
    if (!user) {
      // if problem with user throw error AuthorizationError
      throw new AuthorizationError("Bad Credentials: User not found ");
    }
    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass",
);

export default authenticator;
