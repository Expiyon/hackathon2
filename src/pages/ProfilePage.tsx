import { shortenAddress } from '../utils/format'
import { useDashboardContext } from '../hooks/useDashboardContext'
import { useWalletTickets } from '../hooks/useSuivenContract'
import { formatTimestamp } from '../utils/sui'

function ProfilePage() {
  const { accountAddress } = useDashboardContext()
  const { data: tickets = [], isLoading } = useWalletTickets(accountAddress)

  return (
    <section className="profile-section">
      <header>
        <p className="eyebrow">Profile</p>
        <h1>Wallet inventory</h1>
        <p>Viewing assets for {shortenAddress(accountAddress)}. All tickets live on Sui as NFTs.</p>
      </header>
      {isLoading && <p>Loading ticket NFTs…</p>}
      {!isLoading && !tickets.length && (
        <p className="status">No Suiven tickets found for this wallet yet.</p>
      )}
      <div className="ticket-grid">
        {tickets.map((ticket) => (
          <article key={ticket.objectId} className="ticket-nft">
            <div>
              <p>{ticket.metadata?.title ?? 'Suiven Ticket'}</p>
              <span>{ticket.metadata?.tiers ?? ticket.metadata?.location ?? 'On-chain proof'}</span>
            </div>
            <div className="ticket-meta">
              <p>Event</p>
              <strong>{shortenAddress(ticket.eventId)}</strong>
            </div>
            <div className={`ticket-status ${ticket.used ? 'used' : 'confirmed'}`}>
              {ticket.used ? 'Used' : 'Active'}
            </div>
            <small>Minted {formatTimestamp(ticket.mintedAt)}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProfilePage
