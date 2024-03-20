import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import EventCard from "../components/EventCard";
import mongoose from "mongoose";
import { useEffect } from "react";

export async function loader({ request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  let query = {};
  if (q) {
    query = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    };
  }

  const events = await mongoose.models.Event.find(query)
    .sort({ createdAt: -1 })
    .populate("user")
    .exec();

  return json({ events, q });
}

export default function Index() {
  const { events, q } = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <div className="page">
      <div className="events-landingpage">
        <div className="events-landingpage-text">
          <h1>Visual art events</h1>
          <p>
            Discover upcoming events created by visual art enthusiasts. Immerse
            yourself in the beauty of creativity through varied selection of
            masterclasses and meetups.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1622542796157-af7cb80b5a62?q=80&w=2371&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
        />
      </div>
      <div className="events-box">
        <Form
          id="search-form"
          onChange={(event) => {
            const isFirstSearch = q === null;
            submit(event.currentTarget, {
              replace: !isFirstSearch,
            });
          }}
          role="search"
        >
          <div className="search-input-wrapper">
            <input
              id="q"
              aria-label="Search events"
              className={`p-2 ${searching ? "loading" : ""}`}
              defaultValue={q || ""}
              placeholder="Search events"
              type="search"
              name="q"
            />
            <div id="search-spinner" aria-hidden hidden={!searching} />
          </div>
        </Form>
        <section className="grid">
          {events.map((event) => (
            <Link key={event._id} className="event-link" to={`${event._id}`}>
              <EventCard event={event} />
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
