import UserAvatar from "./UserAvatar";

export default function EventCard({ event }) {
  const startDate = event.startDate
    ? new Date(event.startDate).toISOString().split("T")[0]
    : "";
  const endDate = event.endDate
    ? new Date(event.endDate).toISOString().split("T")[0]
    : "";

  return (
    <article className="event-card">
      <UserAvatar user={event.user} />
      <h2>{event.title}</h2>
      <img src={event.image} alt={event.caption} />
      <h3>{event.category}</h3>
      <p>Starts {startDate}</p>
      <p>{event.location}</p>
    </article>
  );
}
