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

  const formData = await request.formData();
  const content = formData.get("content");

  const comment = new mongoose.models.Comment({
    user: user._id,
    content,
    event: params.eventId,
  });

  await comment.save();

  // Add the comment to the event's comments
  await mongoose.models.Event.findByIdAndUpdate(params.eventId, {
    $push: { comments: comment._id },
  });

  // Add the comment to the user's comments
  await mongoose.models.User.findByIdAndUpdate(user._id, {
    $push: { comments: comment._id },
  });

  return redirect(`/events/${params.eventId}`);
}
