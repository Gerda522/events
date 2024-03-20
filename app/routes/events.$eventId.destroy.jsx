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

  const event = await mongoose.models.Event.findById(params.eventId).populate(
    "user",
  );
  if (!event || event.user._id.toString() !== user._id.toString()) {
    // Event not found or user is not the owner
    return redirect("/error");
  }

  await mongoose.models.Event.findByIdAndDelete(params.eventId);
  return redirect("/events");
}
