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

  const comment = await mongoose.models.Comment.findById(
    params.commentId,
  ).populate("user");

  // Add logging here
  console.log("User ID:", user._id.toString());
  console.log("Comment User ID:", comment.user._id.toString());
  console.log("Comment:", comment);

  if (!comment || comment.user._id.toString() !== user._id.toString()) {
    // Comment not found or user is not the owner
    return redirect("/error");
  }

  // Remove the comment from the event's comments
  await mongoose.models.Event.findByIdAndUpdate(comment.event, {
    $pull: { comments: params.commentId },
  });

  // Remove the comment from the user's comments
  await mongoose.models.User.findByIdAndUpdate(user._id, {
    $pull: { comments: params.commentId },
  });

  // Delete the comment
  await mongoose.models.Comment.findByIdAndDelete(params.commentId);

  return redirect(`/events/${comment.event}`);
}
