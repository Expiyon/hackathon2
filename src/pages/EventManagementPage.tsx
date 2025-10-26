import { useState } from 'react'
import { useAllEvents, useWithdrawEventFunds } from '../hooks/useSuivenContract'
import { formatMistToSui, formatTimestamp } from '../utils/sui'
import { ADMIN_CAP_ID } from '../config/sui'

function EventManagementPage() {
  const { data: events = [], isLoading } = useAllEvents()
  const { withdrawFunds, isPending } = useWithdrawEventFunds()
  const [status, setStatus] = useState<string | null>(null)

  const getPhase = (sold: number, capacity: number) => {
    if (!capacity) return 'Draft'
    if (sold === 0) return 'Ready'
    if (sold >= capacity) return 'Sold out'
    return 'Ticketing'
  }

  const handleWithdraw = async (eventIndex: number) => {
    const event = events[eventIndex]
    if (!event) return

    setStatus(`Withdrawing funds from ${event.metadata.title}...`)
    try {
      const result = await withdrawFunds(event)
      setStatus(`Funds withdrawn successfully. Digest: ${result.digest}`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to withdraw funds.')
    }
  }

  return (
    <section className="management-section">
      <header>
        <p className="eyebrow">Operations</p>
        <h1>Manage active events</h1>
        <p>Track sales, royalties, and post-event workflows across every program.</p>
      </header>
      {status && <p className="status">{status}</p>}
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
          <span>Balance</span>
          <span />
        </div>
        {events.map((event, index) => (
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
            <span>
              {event.priceIsSui ? `${formatMistToSui(event.balance || '0')} SUI` : event.balance || '0'}
              {ADMIN_CAP_ID && event.balance && event.balance !== '0' && (
                <>
                  <br />
                  <button
                    className="ghost-btn"
                    disabled={isPending}
                    onClick={() => handleWithdraw(index)}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', marginTop: '0.25rem' }}
                    type="button"
                  >
                    {isPending ? 'Withdrawing…' : 'Withdraw'}
                  </button>
                </>
              )}
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
