import { json, redirect } from "@remix-run/node";
import { Form, NavLink, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "../services/auth.server";
import { sessionStorage } from "../services/session.server";

export async function loader({ request }) {
  // If the user is already authenticated redirect to /events directly
  await authenticator.isAuthenticated(request, {
    successRedirect: "/events",
  });
  // Retrieve error message from session if present
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  // Get the error message from the session
  const error = session.get("error");
  // Remove the error message from the session after it's been retrieved
  session.unset("error");
  // Commit the updated session that no longer contains the error message
  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(session),
  });

  return json({ error }, { headers }); // return the error message
}

export default function SignUp() {
  // if i got an error it will come back with the loader data
  const loaderData = useLoaderData();
  console.log("error:", loaderData?.error);

  return (
    <div id="sign-up-page" className="page">
      <h1>Sign Up</h1>
      <Form id="sign-up-form" method="post">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          name="name"
          aria-label="name"
          placeholder="Type your name..."
          required
          autoComplete="off"
        />

        <label htmlFor="lastname">Lastname</label>
        <input
          id="lastname"
          type="text"
          name="lastname"
          aria-label="lastname"
          placeholder="Type your lastname..."
          required
          autoComplete="off"
        />

        <label htmlFor="mail">Mail</label>
        <input
          id="mail"
          type="email"
          name="mail"
          aria-label="mail"
          placeholder="Type your mail..."
          required
          autoComplete="off"
        />

        <label htmlFor="password">Password</label>

        <input
          id="password"
          type="password"
          name="password"
          aria-label="password"
          placeholder="Type your password..."
          required
          autoComplete="off"
        />

        <label htmlFor="image">Profile Image </label>
        <input
          id="image"
          type="url"
          name="image"
          aria-label="image"
          placeholder="Paste your image URL here..."
          required
          autoComplete="off"
        />

        <div className="btns">
          <button>Sign Up</button>
        </div>

        {loaderData?.error ? (
          <div className="error-message">
            <p>{loaderData?.error}</p>
          </div>
        ) : null}

        {loaderData?.error ? (
          <div className="error-message">
            <p>{loaderData?.error.message}</p>
          </div>
        ) : null}
      </Form>
      <p>
        Already have an account? <NavLink to="/signin">Sign in here.</NavLink>
      </p>
    </div>
  );
}

export async function action({ request }) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  try {
    const formData = new URLSearchParams(await request.text());
    const mail = formData.get("mail");
    const password = formData.get("password");
    const name = formData.get("name");
    const lastname = formData.get("lastname");

    // Check if password is a string, includes numbers, includes letters, and is at least 6 characters long
    const hasNumber = /\d/;
    const hasLetter = /[a-zA-Z]/;
    if (
      typeof password !== "string" ||
      !hasNumber.test(password) ||
      !hasLetter.test(password) ||
      password.length < 6
    ) {
      session.set(
        "error",
        "Password should include both numbers and letters, and be at least 6 characters long.",
      );
      const cookie = await sessionStorage.commitSession(session);
      return redirect("/signup", {
        headers: { "Set-Cookie": cookie },
      });
    }

    // Check if name and lastname are strings, at least 2 characters long, and only contain letters
    const onlyLetters = /^[a-zA-Z]+$/;
    if (
      typeof name !== "string" ||
      name.length < 2 ||
      !onlyLetters.test(name) ||
      typeof lastname !== "string" ||
      lastname.length < 2 ||
      !onlyLetters.test(lastname)
    ) {
      session.set(
        "error",
        "Name and lastname should be at least 2 characters long and only contain letters.",
      );
      const cookie = await sessionStorage.commitSession(session);
      return redirect("/signup", {
        headers: { "Set-Cookie": cookie },
      });
    }

    const newUser = Object.fromEntries(formData);
    await mongoose.models.User.create(newUser);

    return redirect("/signin");
  } catch (error) {
    console.log(error);
    session.set("error", error.message);
    const cookie = await sessionStorage.commitSession(session);
    return redirect("/signup", {
      headers: { "Set-Cookie": cookie },
    });
  }
}
