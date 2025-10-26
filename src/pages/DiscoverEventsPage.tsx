import { discoverEvents } from '../data/content'

function DiscoverEventsPage() {
  return (
    <section className="discover-grid">
      {discoverEvents.map((event) => (
        <article key={event.title} className="discover-card">
          <div>
            <p className="home-list-title">{event.title}</p>
            <span>{event.detail}</span>
          </div>
          <div className="discover-meta">
            <p>{event.tiers}</p>
            <button className="ghost-btn">View details</button>
          </div>
        </article>
      ))}
    </section>
  )
}

export default DiscoverEventsPage
