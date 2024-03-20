import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import EventCardSingle from "../components/EventCardSingle";
import mongoose from "mongoose";
import authenticator from "../services/auth.server";
import { sessionStorage } from "../services/session.server";
import { Link } from "react-router-dom";
import EventCardRelated from "../components/EventCardRelated";

export async function loader({ request, params }) {
  let authUser = null;
  try {
    authUser = await authenticator.isAuthenticated(request);
  } catch (error) {
    // User is not authenticated, leave authUser as null
  }

  const event = await mongoose.models.Event.findById(params.eventId).populate([
    "user",
    "participants",
    {
      path: "comments",
      populate: {
        path: "user",
      },
    },
  ]);

  // Fetch all events with the same category
  let relatedEvents = await mongoose.models.Event.find({
    category: event.category,
  });

  // Filter out the current event
  relatedEvents = relatedEvents.filter(
    (relatedEvent) => relatedEvent._id.toString() !== event._id.toString(),
  );

  return json({ event, authUser, relatedEvents });
}

export default function Event() {
  const { event, authUser, relatedEvents } = useLoaderData();

  function confirmDelete(event) {
    const response = confirm("Please confirm you want to delete this event.");
    if (!response) {
      event.preventDefault();
    }
  }

  return (
    <div id="event-page" className="page">
      <div className="event-main">
        <EventCardSingle event={event} />

        {/* Form for submitting a new comment */}

        {authUser && (
          <div className="comment-form">
            <h2>Post a comment</h2>
            <Form method="post" action={`/events/${event._id}/comment`}>
              <textarea name="content" required></textarea>
              <button type="submit">Comment</button>
            </Form>
          </div>
        )}

        {/* Display all comments */}
        {event.comments && event.comments.length > 0 && (
          <div className="comments">
            <h2>Comments</h2>
            {event.comments.map((comment) => (
              <div className="comment" key={comment._id}>
                <p>
                  {comment.user.name} {comment.user.lastname}: {comment.content}{" "}
                  <br />
                </p>
                {authUser && authUser._id === comment.user._id && (
                  <Form
                    method="post"
                    action={`/comments/${comment._id}/destroy`}
                  >
                    <input type="hidden" name="commentId" value={comment._id} />
                    <button type="submit">☒ Delete Comment</button>
                  </Form>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Display all related events */}
        {relatedEvents.length > 0 && (
          <div className="related-events">
            <h2>Related events</h2>
            <div className="related-events-box">
              {relatedEvents.map((relatedEvent) => (
                <Link to={`/events/${relatedEvent._id}`} key={relatedEvent._id}>
                  <EventCardRelated event={relatedEvent} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="event-section">
        {authUser && authUser._id === event.user._id && (
          <div className="edit-btns">
            <h2>Manage event</h2>
            <Form action="update">
              <button className="edit-btn">✎ Edit event</button>
            </Form>
            <Form action="destroy" method="post" onSubmit={confirmDelete}>
              <button className="delete-btn">☒ Delete event</button>
            </Form>
          </div>
        )}
        {authUser &&
          authUser._id !== event.user._id &&
          !event.participants.some((e) => e._id === authUser._id) && (
            <div className="join-event">
              <h2>Express your interest by joining the event</h2>
              <p>
                Are you interested in the event? Join the event and show others
                that you want to participate!
              </p>
              <Form method="post" action="">
                <button>Join Event</button>
              </Form>
            </div>
          )}

        {/* Display the list of participants */}
        <div className="participants-list">
          {event.participants.length > 0 && <h2>Participants</h2>}
          {event.participants.map((user) => (
            <div className="participants-info" key={user._id}>
              <img src={user.image} alt={user.name} />
              <p>
                {user.name} {user.lastname}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function action({ request, params }) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  const authUser = session.get("user");
  const eventId = params.eventId;

  if (!authUser) {
    return redirect("/login");
  }

  const User = mongoose.model("User");
  const Event = mongoose.model("Event");

  const user = await User.findById(authUser._id);
  const event = await Event.findById(eventId);

  if (!user.joinedEvents.includes(eventId)) {
    user.joinedEvents.push(eventId);
    await user.save();
  }

  if (!event.participants.includes(authUser._id)) {
    event.participants.push(authUser._id);
    await event.save();
  }

  return redirect(`/events/${eventId}`);
}
