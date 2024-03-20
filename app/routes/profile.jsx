import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  // Load the user with its joinedEvents
  const populatedUser = await mongoose.models.User.findById(user._id).populate(
    "joinedEvents",
  );

  const events = await mongoose.models.Event.find({ user: user._id }).exec();

  return json({ user: populatedUser, events });
}

export default function Profile() {
  const { user, events } = useLoaderData();

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <div className="profile-box">
        <div className="profile-info">
          <div className="profile-name">
            <p>{user.name} </p>
            <p>{user.lastname}</p>
          </div>
          <p>Mail: {user.mail}</p>
          <Form method="post">
            <button>Logout</button>
          </Form>
        </div>
        <div className="profile-img">
          <img src={user.image} alt="Profile" />
        </div>
      </div>
      <div className="user-events">
        {events.length > 0 && <h2>Your created events</h2>}
        <div className="user-events-box">
          {events.map((event) => (
            <div className="user-event" key={event._id}>
              <Link to={`/events/${event._id}`}>
                <h3>{event.title}</h3>
                <img src={event.image} alt={event.title} />
                <h4>{event.category}</h4>
                <p>{event.location}</p>
                <p>{event.date}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="joined-events">
        {user.joinedEvents.length > 0 && <h2>Your joined events</h2>}
        <div className="joined-events-box">
          {user.joinedEvents.map((event) => (
            <div className="user-event" key={event._id}>
              <Link to={`/events/${event._id}`}>
                <p>{event.title}</p>
                <img src={event.image} alt={event.title} />
                <h4>{event.category}</h4>
                <p>{event.location}</p>
                <p>{event.date}</p>
              </Link>
              <Form method="post" action={`/events/${event._id}/leave`}>
                <button>Leave Event</button>
              </Form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function action({ request }) {
  await authenticator.logout(request, { redirectTo: "/signin" });
}
