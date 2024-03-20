import mongoose from "mongoose";

export default async function seedDb() {
  const eventCount = await mongoose.models.Event.countDocuments();
  const userCount = await mongoose.models.User.countDocuments();

  if (eventCount === 0) {
    console.log("Seeding events...");
    insertData();
  }

  if (userCount === 0) {
    console.log("Seeding users...");
    insertUsers();
  }
}

async function insertData() {
  const events = [];
  await mongoose.models.Event.insertMany(events);
}

async function insertUsers() {
  const users = [];
  await mongoose.models.User.insertMany(users);
}
