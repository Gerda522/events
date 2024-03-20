import { mongoose } from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: String,
    description: String,
    image: String,
    category: {
      type: String,
      enum: [
        "People and Portraits",
        "Nature and Landscapes",
        "Still Life",
        "Abstract Art",
        "Fantasy",
        "Emotions and Concepts",
      ],
    },
    location: String,
    startDate: Date,
    endDate: Date,
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    image: String,
    mail: {
      type: String,
      required: true, // Ensure user emails are required
      unique: true, // Ensure user emails are unique
    },
    name: String,
    lastname: String,
    password: {
      type: String,
      required: true, // Ensure user passwords are required
      select: false, // Automatically exclude from query results
    },
    joinedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },

  { timestamps: true },
);

const commentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: String,
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  },
  { timestamps: true },
);

// pre save password hook
userSchema.pre("save", async function (next) {
  const user = this; // this refers to the user document

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) {
    return next(); // continue
  }

  const salt = await bcrypt.genSalt(10); // generate a salt
  user.password = await bcrypt.hash(user.password, salt); // hash the password
  next(); // continue
});

// For each model you want to create, please define the model's name, the
// associated schema (defined above), and the name of the associated collection
// in the database (which will be created automatically).
export const models = [
  { name: "User", schema: userSchema, collection: "users" },
  { name: "Event", schema: eventSchema, collection: "events" },
  { name: "Comment", schema: commentSchema, collection: "comments" },
];
