import { redirect } from "@remix-run/node";
import mongoose from "mongoose";
import authenticator from "../services/auth.server";

export async function loader({ request }) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });
}

export async function action({ request, params }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  // Remove the event from the user's joinedEvents
  await mongoose.models.User.findByIdAndUpdate(user._id, {
    $pull: { joinedEvents: params.eventId },
  });

  // Remove the user from the event's participants
  await mongoose.models.Event.findByIdAndUpdate(params.eventId, {
    $pull: { participants: user._id },
  });

  // Redirect to the profile page
  return redirect(`/profile`);
}
