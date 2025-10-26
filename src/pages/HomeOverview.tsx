import { NavLink } from 'react-router-dom'
import { automationTasks, dashboardStats, upcomingEvents } from '../data/content'

function HomeOverview() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">Control Center</p>
          <h1>Everything for your on-chain audience in one place</h1>
          <p>
            Manage events, automate resale logic, drop POAP rewards, and monitor live wallets tied to your
            ecosystem. Suiven keeps every touchpoint transparent and programmable.
          </p>
          <div className="home-actions">
            <NavLink to="/create" className="primary-btn as-link">
              Launch new event
            </NavLink>
          </div>
        </div>
        <div className="home-stat-grid">
          {dashboardStats.map((item) => (
            <div key={item.label} className="home-stat-card">
              <span>{item.value}</span>
              <p>{item.label}</p>
              <small>{item.detail}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="home-grid">
        <article className="home-card span-2">
          <div className="home-card-head">
            <h3>Upcoming programs</h3>
            <button className="wallet-link" type="button">
              View calendar
            </button>
          </div>
          <ul className="home-list">
            {upcomingEvents.map((event) => (
              <li key={event.title}>
                <div>
                  <p className="home-list-title">{event.title}</p>
                  <span>{event.meta}</span>
                </div>
                <div className="home-tag">{event.status}</div>
              </li>
            ))}
          </ul>
        </article>

        <article className="home-card">
          <div className="home-card-head">
            <h3>Automation queue</h3>
          </div>
          <ul className="home-list stacked">
            {automationTasks.map((task) => (
              <li key={task.title}>
                <div>
                  <p className="home-list-title">{task.title}</p>
                  <span>{task.body}</span>
                </div>
                <button className="secondary-btn slim">Run</button>
              </li>
            ))}
          </ul>
        </article>

        <article className="home-card">
          <div className="home-card-head">
            <h3>Wallet insights</h3>
          </div>
          <div className="wallet-insights">
            <div>
              <p>Top geography</p>
              <strong>EU · 42%</strong>
            </div>
            <div>
              <p>Average resale premium</p>
              <strong>+23%</strong>
            </div>
            <div>
              <p>POAP redemption</p>
              <strong>78%</strong>
            </div>
          </div>
          <p className="home-footnote">
            Data refreshes every 12 minutes. Connect data warehouse to stream raw events.
          </p>
        </article>
      </section>
    </>
  )
}

export default HomeOverview
