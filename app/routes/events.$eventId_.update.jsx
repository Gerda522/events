import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import mongoose from "mongoose";
import authenticator from "../services/auth.server";

export async function loader({ request, params }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  if (!user) {
    // User is not authenticated
    throw new Response("Not Authorized", { status: 401 });
  }

  const event = await mongoose.models.Event.findById(params.eventId).populate(
    "user",
  );
  if (!event || event.user._id.toString() !== user._id.toString()) {
    // Event not found or user is not the owner
    throw new Response("Not Found", { status: 404 });
  }
  return json({ event });
}

export default function UpdateEvent() {
  const { event } = useLoaderData();
  const [image, setImage] = useState(event.image);
  const navigate = useNavigate();

  function handleCancel() {
    navigate(-1);
  }

  return (
    <div className="update-event-page">
      <h1>Edit Event</h1>
      <Form id="event-form-update" method="post">
        <div className="update-event-box1">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            defaultValue={event.title}
            name="title"
            type="text"
            aria-label="title"
            placeholder="Enter a title..."
          />

          <label htmlFor="description">Description</label>
          <input
            id="description"
            defaultValue={event.description}
            name="description"
            aria-label="description"
            placeholder="Write a description..."
          />

          <label htmlFor="image">Image URL</label>
          <input
            name="image"
            defaultValue={event.image}
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

        <div className="update-event-box2">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            defaultValue={event.category}
            required
          >
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
            defaultValue={event.location}
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
              defaultValue={event.startDate}
              name="startDate"
              type="date"
              aria-label="start-date"
            />

            <label htmlFor="endDate">Ends</label>
            <input
              id="endDate"
              defaultValue={event.endDate}
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
        </div>
        <input name="uid" type="text" defaultValue={event.uid} hidden />
      </Form>
    </div>
  );
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const event = Object.fromEntries(formData);
  const authUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  if (!authUser) {
    // User is not authenticated
    return redirect("/signin");
  }
  // Fetch the event to check if the current user is the creator
  const eventToUpdate = await mongoose.models.Event.findById(params.eventId);

  if (eventToUpdate.user.toString() !== authUser._id.toString()) {
    // User is not the creator of the event, redirect
    return redirect(`/events/${params.eventId}`);
  }
  // Since eventToUpdate is already the document you want to update,
  // you can directly modify and save it, which can be more efficient than findByIdAndUpdate
  eventToUpdate.title = event.title;
  eventToUpdate.category = event.category;
  eventToUpdate.image = event.image;
  eventToUpdate.description = event.description;
  eventToUpdate.location = event.location;
  eventToUpdate.date = event.date;
  await eventToUpdate.save();

  return redirect(`/events/${params.eventId}`);
}
