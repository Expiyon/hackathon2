import { walletTickets } from '../data/content'
import { shortenAddress } from '../utils/format'
import { useDashboardContext } from '../hooks/useDashboardContext'

function ProfilePage() {
  const { accountAddress } = useDashboardContext()

  return (
    <section className="profile-section">
      <header>
        <p className="eyebrow">Profile</p>
        <h1>Wallet inventory</h1>
        <p>Viewing assets for {shortenAddress(accountAddress)}. All tickets live on Sui as NFTs.</p>
      </header>
      <div className="ticket-grid">
        {walletTickets.map((ticket) => (
          <article key={ticket.tokenId} className="ticket-nft">
            <div>
              <p>{ticket.event}</p>
              <span>{ticket.tier}</span>
            </div>
            <div className="ticket-meta">
              <p>Token</p>
              <strong>{ticket.tokenId}</strong>
            </div>
            <div className={`ticket-status ${ticket.status.toLowerCase()}`}>{ticket.status}</div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProfilePage
