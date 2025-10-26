import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ORGANIZER_CAP_ID } from '../config/sui'
import { useCreateSuivenEvent, useEventFormDefaults } from '../hooks/useSuivenContract'
import { suiToMist } from '../utils/sui'

function EventCreationPage() {
  const defaults = useEventFormDefaults()
  const [title, setTitle] = useState('Suiven Showcase')
  const [location, setLocation] = useState('Lisbon, Portugal')
  const [detail, setDetail] = useState('Apr 12 · 18:00 UTC')
  const [tiers, setTiers] = useState('VIP · Pro · Community')
  const [description, setDescription] = useState(
    'Programmable ticket drop powered by Suiven on Sui.',
  )
  const [capacity, setCapacity] = useState(150)
  const [price, setPrice] = useState('1')
  const [royaltyBps, setRoyaltyBps] = useState(500)
  const [transferable, setTransferable] = useState(true)

  const toInputValue = (timestamp: number) => {
    const date = new Date(timestamp)
    const offset = date.getTimezoneOffset()
    const local = new Date(date.getTime() - offset * 60 * 1000)
    return local.toISOString().slice(0, 16)
  }

  const [startTime, setStartTime] = useState(toInputValue(defaults.startTs))
  const [endTime, setEndTime] = useState(toInputValue(defaults.endTs))
  const [resaleWindow, setResaleWindow] = useState(toInputValue(defaults.endTs))
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)

  const { createEvent, isPending } = useCreateSuivenEvent()

  const metadataPayload = useMemo(
    () =>
      JSON.stringify(
        {
          title,
          location,
          detail,
          tiers,
          description,
        },
        null,
        2,
      ),
    [title, location, detail, tiers, description],
  )

  const resetForm = () => {
    setTitle('Suiven Showcase')
    setLocation('Lisbon, Portugal')
    setDetail('Apr 12 · 18:00 UTC')
    setTiers('VIP · Pro · Community')
    setDescription('Programmable ticket drop powered by Suiven on Sui.')
    setCapacity(150)
    setPrice('1')
    setRoyaltyBps(500)
    setTransferable(true)
    setStartTime(toInputValue(defaults.startTs))
    setEndTime(toInputValue(defaults.endTs))
    setResaleWindow(toInputValue(defaults.endTs))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus(null)

    const startTs = Date.parse(startTime)
    const endTsValue = Date.parse(endTime)
    const resaleWindowEnd = Date.parse(resaleWindow || endTime)

    if (Number.isNaN(startTs) || Number.isNaN(endTsValue)) {
      setStatus({ type: 'error', message: 'Please provide valid start/end timestamps.' })
      return
    }

    try {
      const result = await createEvent({
        metadataPayload,
        startTs,
        endTs: endTsValue,
        capacity: Number(capacity),
        priceAmount: suiToMist(price),
        priceIsSui: true,
        priceTokenType: 'SUI',
        royaltyBps: Number(royaltyBps),
        transferable,
        resaleWindowEnd,
      })

      // Extract event ID from transaction result
      const eventId = (result as any).effects?.created?.[0]?.reference?.objectId ||
                     (result as any).effects?.events?.[0]?.data?.newObject?.objectId

      if (eventId) {
        setCreatedEventId(eventId)
        setStatus({
          type: 'success',
          message: `Event created successfully! Event ID: ${eventId}`,
        })
      } else {
        setStatus({
          type: 'success',
          message: 'Event transaction submitted successfully. Check your wallet for the event ID.',
        })
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit transaction.',
      })
    }
  }

  return (
    <section className="home-hero stacked">
      <div className="home-hero-copy">
        <p className="eyebrow">Create</p>
        <h1>Spin up a programmable event in minutes</h1>
        <p>
          Define metadata, ticket tiers, resale rules, and access controls. Suiven handles minting, wallet
          delivery, and compliance-ready reporting.
        </p>
        {!ORGANIZER_CAP_ID && (
          <p className="warning">
            Organizer capability not configured. Set <code>VITE_SUIVEN_ORGANIZER_CAP_ID</code> in your
            environment to enable publishing.
          </p>
        )}
        {status && (
          <p className={`status ${status.type}`}>
            {status.message}
            {createdEventId && (
              <div style={{ marginTop: '10px' }}>
                <button
                  className="secondary-btn small"
                  onClick={() => navigator.clipboard.writeText(createdEventId)}
                  type="button"
                >
                  Copy Event ID
                </button>
                <a
                  href={`https://suiscan.xyz/mainnet/object/${createdEventId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="wallet-link"
                  style={{ marginLeft: '10px' }}
                >
                  View on SuiScan
                </a>
              </div>
            )}
          </p>
        )}
      </div>
      <form className="creation-form" onSubmit={handleSubmit}>
        <label>
          <span>Event title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label>
          <span>Location</span>
          <input value={location} onChange={(event) => setLocation(event.target.value)} />
        </label>
        <label>
          <span>Primary schedule</span>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            required
          />
        </label>
        <label>
          <span>Ends</span>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            required
          />
        </label>
        <label>
          <span>Ticket tiers</span>
          <input value={tiers} onChange={(event) => setTiers(event.target.value)} />
        </label>
        <label>
          <span>Agenda detail</span>
          <input value={detail} onChange={(event) => setDetail(event.target.value)} />
        </label>
        <label>
          <span>Description</span>
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label>
          <span>Capacity</span>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(event) => setCapacity(Number(event.target.value))}
            required
          />
        </label>
        <label>
          <span>Price (SUI)</span>
          <input value={price} onChange={(event) => setPrice(event.target.value)} />
        </label>
        <label>
          <span>Royalty (basis points)</span>
          <input
            type="number"
            value={royaltyBps}
            onChange={(event) => setRoyaltyBps(Number(event.target.value))}
          />
        </label>
        <label>
          <span>Resale allowed until</span>
          <input
            type="datetime-local"
            value={resaleWindow}
            onChange={(event) => setResaleWindow(event.target.value)}
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={transferable}
            onChange={(event) => setTransferable(event.target.checked)}
          />
          <span>Tickets are transferable</span>
        </label>
        <label>
          <span>Auto-generated metadata JSON</span>
          <textarea value={metadataPayload} readOnly rows={6} />
        </label>
        <div className="home-actions">
          <button className="primary-btn" type="submit" disabled={isPending || !ORGANIZER_CAP_ID}>
            {isPending ? 'Signing...' : 'Create event on Sui'}
          </button>
          <button className="secondary-btn" type="button" onClick={resetForm}>
            Reset fields
          </button>
        </div>
      </form>
    </section>
  )
}

export default EventCreationPage
