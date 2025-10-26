import { useEffect, useState } from 'react'
import { useDashboardContext } from '../hooks/useDashboardContext'
import { useBurnTicketAndMintPOAP, useEventDetails, useWalletPOAPs, useWalletTickets } from '../hooks/useSuivenContract'
import { shortenAddress } from '../utils/format'
import { loadProfile, saveProfile, type UserProfile } from '../utils/profileStorage'
import { formatTimestamp } from '../utils/sui'

function ProfilePage() {
  const { accountAddress } = useDashboardContext()
  const { data: tickets = [], isLoading } = useWalletTickets(accountAddress)
  const { data: poaps = [], isLoading: poapsLoading } = useWalletPOAPs(accountAddress)
  const { burnAndMint, isPending: burningPending } = useBurnTicketAndMintPOAP(accountAddress)
  const [status, setStatus] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    surname: '',
    email: '',
    telegram: '',
    xHandle: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  const { data: eventDetails } = useEventDetails(
    tickets.find(t => t.objectId === selectedTicket)?.eventId
  )

  // Load profile from Local Storage when component mounts or wallet changes
  useEffect(() => {
    const loadedProfile = loadProfile(accountAddress)
    setProfile(loadedProfile)
    setIsEditing(false)
  }, [accountAddress])

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = () => {
    const success = saveProfile(accountAddress, profile)
    if (success) {
      setSaveStatus('Profile saved successfully!')
      setIsEditing(false)
      setTimeout(() => setSaveStatus(null), 3000)
    } else {
      setSaveStatus('Failed to save profile')
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const handleCancel = () => {
    const loadedProfile = loadProfile(accountAddress)
    setProfile(loadedProfile)
    setIsEditing(false)
  }

  const validateEmail = (email: string): boolean => {
    if (!email) return true // Empty is valid (optional field)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleBurnTicketAndMintPOAP = async (ticketId: string, metadataUri: string) => {
    try {
      setStatus('Burning ticket and minting POAP...')
      await burnAndMint(ticketId, metadataUri)
      setStatus('Success! POAP minted. Ticket burned.')
      setTimeout(() => setStatus(null), 5000)
    } catch (error) {
      console.error('Failed to burn ticket and mint POAP:', error)
      setStatus('Failed to burn ticket and mint POAP')
      setTimeout(() => setStatus(null), 5000)
    }
  }

  return (
    <section className="profile-section">
      <header>
        <p className="eyebrow">Profile</p>
        <h1>Profile Information</h1>
        <p>Viewing profile for {shortenAddress(accountAddress)}</p>
      </header>

      {/* Profile Information Form */}
      <div className="profile-form-container">
        <div className="profile-form-header">
          <h2>Personal Information</h2>
          {!isEditing ? (
            <button
              className="secondary-btn slim"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              Edit Profile
            </button>
          ) : (
            <div className="profile-form-actions">
              <button
                className="secondary-btn slim"
                onClick={handleCancel}
                type="button"
              >
                Cancel
              </button>
              <button
                className="primary-btn slim"
                onClick={handleSaveProfile}
                disabled={!validateEmail(profile.email)}
                type="button"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {saveStatus && <p className="save-status">{saveStatus}</p>}

        <div className="profile-form">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.25rem',
              marginBottom: '1.25rem'
            }}
          >
            <label>
              <span>Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  placeholder="Enter your name"
                />
              ) : (
                <div className="profile-field-value">{profile.name || '—'}</div>
              )}
            </label>

            <label>
              <span>Surname</span>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.surname}
                  onChange={(e) => handleProfileChange('surname', e.target.value)}
                  placeholder="Enter your surname"
                />
              ) : (
                <div className="profile-field-value">{profile.surname || '—'}</div>
              )}
            </label>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.25rem'
            }}
          >
            <label>
              <span>Email</span>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className={!validateEmail(profile.email) ? 'invalid' : ''}
                  />
                  {!validateEmail(profile.email) && (
                    <small className="error-text">Please enter a valid email address</small>
                  )}
                </>
              ) : (
                <div className="profile-field-value">{profile.email || '—'}</div>
              )}
            </label>

            <label>
              <span>Telegram Handle</span>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.telegram}
                  onChange={(e) => handleProfileChange('telegram', e.target.value)}
                  placeholder="@username"
                />
              ) : (
                <div className="profile-field-value">{profile.telegram || '—'}</div>
              )}
            </label>

            <label>
              <span>X (Twitter) Handle</span>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.xHandle}
                  onChange={(e) => handleProfileChange('xHandle', e.target.value)}
                  placeholder="@username"
                />
              ) : (
                <div className="profile-field-value">{profile.xHandle || '—'}</div>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Ticket Inventory Section */}
      <div className="ticket-inventory">
        <h2>Wallet Inventory</h2>
        <p>All tickets live on Sui as NFTs.</p>
      </div>

      {isLoading && <p>Loading ticket NFTs…</p>}
      {!isLoading && !tickets.length && (
        <p className="status">No Suiven tickets found for this wallet yet.</p>
      )}
      {status && <p className="status">{status}</p>}
      <div className="ticket-grid">
        {tickets.map((ticket) => (
          <article key={ticket.objectId} className="ticket-nft">
            <div>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{ticket.metadata?.title ?? 'Suiven Ticket'}</p>
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
            {!ticket.used && (
              <button
                className="secondary-btn small"
                onClick={() => handleBurnTicketAndMintPOAP(ticket.objectId, ticket.metadataUri)}
                disabled={burningPending}
                type="button"
              >
                {burningPending ? 'Processing...' : 'Mark as Used'}
              </button>
            )}
          </article>
        ))}
      </div>

      {/* POAP Inventory Section */}
      <div className="ticket-inventory" style={{ marginTop: '3rem' }}>
        <h2>Attendance POAPs</h2>
        <p>Proof of Attendance Protocol - Soulbound NFTs that cannot be transferred.</p>
      </div>

      {poapsLoading && <p>Loading POAPs…</p>}
      {!poapsLoading && !poaps.length && (
        <p className="status">No POAPs found. Claim one by marking a ticket as used!</p>
      )}
      <div className="ticket-grid">
        {poaps.map((poap) => (
          <article key={poap.objectId} className="ticket-nft">
            <div>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{poap.metadata?.title ?? poap.eventName} - POAP</p>
              <span>{poap.metadata?.location ?? 'Attendance Proof'}</span>
            </div>
            <div className="ticket-meta">
              <p>Event</p>
              <strong>{shortenAddress(poap.eventId)}</strong>
            </div>
            <div className="ticket-status confirmed" style={{ background: '#10b981' }}>
              Soulbound
            </div>
            <small>Issued {formatTimestamp(poap.issuedTs)}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProfilePage
