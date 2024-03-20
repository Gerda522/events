import { json, redirect } from "@remix-run/node";
import { Form, useNavigate, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { useState } from "react";
import authenticator from "../services/auth.server";
import { sessionStorage } from "../services/session.server";

export async function loader({ request }) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });
  const error = session.get("error");
  session.unset("error");
  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(session),
  });

  return json({ user, error }, { headers });
}

export default function AddEvent() {
  const loaderData = useLoaderData();
  console.log("error:", loaderData?.error);
  const [image, setImage] = useState(
    "https://placehold.co/600x400?text=Add+your+amazing+image",
  );
  const navigate = useNavigate();

  function handleCancel() {
    navigate(-1);
  }

  return (
    <div className="add-event-page">
      <h1>Create event</h1>
      <Form id="event-form" method="post">
        <div className="add-event-box1">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            aria-label="title"
            placeholder="Enter a title..."
          />

          <label htmlFor="description">Description</label>
          <input
            id="description"
            name="description"
            aria-label="description"
            placeholder="Tell us about the event..."
            required
          />

          <label htmlFor="image">Image URL</label>
          <input
            name="image"
            type="url"
            onChange={(e) => setImage(e.target.value)}
            placeholder="Paste an image URL..."
          />

          <label htmlFor="image-preview">Image Preview</label>
          <img
            id="image-preview"
            className="image-preview"
            src={
              image
                ? image
                : "https://placehold.co/600x400?text=Paste+an+image+URL"
            }
            alt="Choose"
            onError={(e) =>
              (e.target.src =
                "https://placehold.co/600x400?text=Error+loading+image")
            }
          />
        </div>
        <div className="add-event-box2">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" required>
            <option value="">Select a category...</option>
            <option value="People and Portraits">People and Portraits</option>
            <option value="Nature and Landscapes">Nature and Landscapes</option>
            <option value="Still Life">Still Life</option>
            <option value="Abstract Art">Abstract Art</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Emotions and Concepts">Emotions and Concepts</option>
          </select>

          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            aria-label="location"
            placeholder="Enter a location..."
          />
          <label htmlFor="startDate">Date</label>
          <div className="event-date">
            <label htmlFor="startDate">Starts</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              aria-label="start-date"
            />

            <label htmlFor="endDate">Ends</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              aria-label="end-date"
            />
          </div>

          <div className="btns">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn-save">Save</button>
          </div>
          {loaderData?.error ? (
            <div className="error-message">
              <p>{loaderData?.error}</p>
            </div>
          ) : null}
        </div>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  try {
    // Get the authenticated user
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/signin",
    });
    console.log(user);
    const formData = await request.formData();
    const event = Object.fromEntries(formData);

    // Check if title includes letters and is longer than 5 characters
    const hasLetter = /[a-zA-Z]/;
    const title = event.title;
    if (!hasLetter.test(title) || title.length <= 5) {
      session.set(
        "error",
        "Title should include letters and be longer than 5 characters.",
      );
      const cookie = await sessionStorage.commitSession(session);
      return redirect("/add-event", { headers: { "Set-Cookie": cookie } });
    }

    // Check if description includes letters and is longer than 50 characters
    const description = event.description;
    if (!hasLetter.test(description) || description.length <= 50) {
      session.set(
        "error",
        "Description should include letters and be longer than 50 characters.",
      );
      const cookie = await sessionStorage.commitSession(session);
      return redirect("/add-event", { headers: { "Set-Cookie": cookie } });
    }

    // Check if location includes letters and is longer than 2 characters
    const location = event.location;
    if (!hasLetter.test(location) || location.length <= 2) {
      session.set(
        "error",
        "Location should include letters and be longer than 2 characters.",
      );
      const cookie = await sessionStorage.commitSession(session);
      return redirect("/add-event", { headers: { "Set-Cookie": cookie } });
    }

    // Add the authenticated user's id to the event.user field
    event.user = user._id;
    // Save the event to the database
    await mongoose.models.Event.create(event);

    return redirect("/events");
  } catch (error) {
    console.log(error);
    session.set("error", error.message);
    const cookie = await sessionStorage.commitSession(session);
    return redirect("/add-event", {
      headers: { "Set-Cookie": cookie },
    });
  }
}
