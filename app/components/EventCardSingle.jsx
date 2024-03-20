import UserAvatar from "./UserAvatar";

export default function EventCardSingle({ event }) {
  const startDate = event.startDate
    ? new Date(event.startDate).toISOString().split("T")[0]
    : "";
  const endDate = event.endDate
    ? new Date(event.endDate).toISOString().split("T")[0]
    : "";

  return (
    <article className="event-card-single">
      <UserAvatar user={event.user} />

      <div className="event-card-single-info">
        <h2>{event.title}</h2>
        <h3>{event.category}</h3>
        <img src={event.image} alt={event.caption} />
        <div className="event-card-single-date">
          <p>Starts: {startDate}</p>
          <p>Ends: {endDate}</p>
        </div>
        <h4> Location</h4>
        <p>{event.location}</p>
        <h4>Description</h4>
        <p>{event.description}</p>
      </div>
    </article>
  );
}
