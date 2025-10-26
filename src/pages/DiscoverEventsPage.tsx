import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useAllEvents, usePurchaseTicket } from '../hooks/useSuivenContract'
import { formatMistToSui, formatTimestamp } from '../utils/sui'

function DiscoverEventsPage() {
  const currentAccount = useCurrentAccount()
  const { data: allEvents = [], isLoading: allLoading } = useAllEvents()
  const { purchaseTicket, isPending } = usePurchaseTicket(currentAccount?.address)
  const [status, setStatus] = useState<string | null>(null)

  const events = allEvents
  const isLoading = allLoading

  const handleMint = async (eventIndex: number) => {
    const event = events[eventIndex]
    if (!event) return
    setStatus(`Minting ticket for ${event.metadata.title}...`)
    try {
      const result = await purchaseTicket(event)
      setStatus(`Ticket minted. Digest: ${result.digest}`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to mint ticket.')
    }
  }

  if (isLoading) {
    return <section className="discover-grid">Loading on-chain events…</section>
  }

  if (!events.length) {
    return (
      <section className="discover-grid">
        <article className="discover-card">
          <div>
            <p className="home-list-title">No events available</p>
            <span>Check back later or create your first event to get started.</span>
          </div>
        </article>
      </section>
    )
  }

  return (
    <section className="discover-grid">
      <header className="discover-header">
        <h2>Discover Events</h2>
      </header>
      {status && <p className="status">{status}</p>}
      {events.map((event, index) => (
        <article key={event.objectId} className="discover-card">
          <div>
            <p className="home-list-title">{event.metadata.title}</p>
            <span>
              {event.metadata.detail || `${formatTimestamp(event.startTs)} - ${formatTimestamp(event.endTs)}`}
            </span>
            {event.metadata.location && <small>{event.metadata.location}</small>}
          </div>
          <div className="discover-meta">
            <p>
              {event.priceIsSui
                ? `${formatMistToSui(event.priceAmount)} SUI`
                : `${event.priceAmount} ${event.priceTokenType || ''}`}
            </p>
            <p>
              {event.sold} / {event.capacity} sold
            </p>
            <button
              className="ghost-btn"
              disabled={!currentAccount || isPending}
              onClick={() => handleMint(index)}
              type="button"
            >
              {!currentAccount ? 'Connect wallet' : isPending ? 'Minting…' : 'Mint ticket'}
            </button>
          </div>
        </article>
      ))}
    </section>
  )
}

export default DiscoverEventsPage
