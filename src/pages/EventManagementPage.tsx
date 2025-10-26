import { managementRows } from '../data/content'

function EventManagementPage() {
  return (
    <section className="management-section">
      <header>
        <p className="eyebrow">Operations</p>
        <h1>Manage active events</h1>
        <p>Track sales, royalties, and post-event workflows across every program.</p>
      </header>
      <div className="management-table">
        <div className="table-row table-head">
          <span>Event</span>
          <span>Phase</span>
          <span>Sold</span>
          <span>Revenue</span>
          <span />
        </div>
        {managementRows.map((row) => (
          <div key={row.name} className="table-row">
            <span>{row.name}</span>
            <span>{row.phase}</span>
            <span>{row.sold}</span>
            <span>{row.revenue}</span>
            <button className="wallet-link" type="button">
              Open workspace
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default EventManagementPage
