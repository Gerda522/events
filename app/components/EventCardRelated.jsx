export default function EventCardRelated({ event }) {
  const startDate = event.startDate
    ? new Date(event.startDate).toISOString().split("T")[0]
    : "";
  const endDate = event.endDate
    ? new Date(event.endDate).toISOString().split("T")[0]
    : "";

  return (
    <article className="event-card-related">
      <div className="event-card-related-info">
        <h2>{event.title}</h2>
        <h3>{event.category}</h3>
        <img src={event.image} />
        <p>Starts {startDate}</p>
      </div>
    </article>
  );
}
