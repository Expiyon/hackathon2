import { useAllEvents } from '../hooks/useSuivenContract'
import { formatMistToSui, formatTimestamp } from '../utils/sui'

function EventManagementPage() {
  const { data: events = [], isLoading } = useAllEvents()

  const getPhase = (sold: number, capacity: number) => {
    if (!capacity) return 'Draft'
    if (sold === 0) return 'Ready'
    if (sold >= capacity) return 'Sold out'
    return 'Ticketing'
  }

  return (
    <section className="management-section">
      <header>
        <p className="eyebrow">Operations</p>
        <h1>Manage active events</h1>
        <p>Track sales, royalties, and post-event workflows across every program.</p>
      </header>
      {isLoading && <p>Syncing shared event objects…</p>}
      {!isLoading && !events.length && (
        <p className="status">No events found on the blockchain yet. Create your first event to get started.</p>
      )}
      <div className="management-table">
        <div className="table-row table-head">
          <span>Event</span>
          <span>Phase</span>
          <span>Sold</span>
          <span>Revenue</span>
          <span />
        </div>
        {events.map((event) => (
          <div key={event.objectId} className="table-row">
            <span>
              {event.metadata.title}
              <br />
              <small>{formatTimestamp(event.startTs)}</small>
            </span>
            <span>{getPhase(event.sold, event.capacity)}</span>
            <span>
              {event.sold} / {event.capacity}
            </span>
            <span>
              {event.priceIsSui ? `${formatMistToSui(event.priceAmount)} SUI` : event.priceAmount}
              <br />
              <small>{event.royaltyBps / 100}% royalty</small>
            </span>
            <a
              className="wallet-link"
              href={`https://suiscan.xyz/mainnet/object/${event.objectId}`}
              target="_blank"
              rel="noreferrer"
            >
              View object
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}

export default EventManagementPage
