import { creationFields } from '../data/content'

function EventCreationPage() {
  return (
    <section className="home-hero stacked">
      <div className="home-hero-copy">
        <p className="eyebrow">Create</p>
        <h1>Spin up a programmable event in minutes</h1>
        <p>
          Define metadata, ticket tiers, resale rules, and access controls. Suiven handles minting, wallet
          delivery, and compliance-ready reporting.
        </p>
      </div>
      <div className="creation-form">
        {creationFields.map((field) => (
          <label key={field.label}>
            <span>{field.label}</span>
            <input placeholder={field.placeholder} />
          </label>
        ))}
        <label>
          <span>Resale logic</span>
          <textarea placeholder="e.g. 8% royalties to organizers, allow transfer 24h before showtime." />
        </label>
        <div className="home-actions">
          <button className="primary-btn">Generate draft contract</button>
          <button className="secondary-btn">Preview attendee flow</button>
        </div>
      </div>
    </section>
  )
}

export default EventCreationPage
