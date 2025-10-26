import WalletConnect from '../components/WalletConnect'
import {
  featureCards,
  flowSteps,
  landingStats,
  proofPoints,
} from '../data/content'

function Landing() {
  return (
    <div className="page">
      <header className="hero" id="home">
        <nav className="nav">
          <div className="brand">Suiven</div>
          <div className="nav-links">
            <a href="#features">Solution</a>
            <a href="#flow">How it works</a>
            <a href="#trust">Why Sui</a>
          </div>
          <div className="nav-actions">
            <WalletConnect />
            <button className="ghost-btn">Request access</button>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Sui-native ticketing intelligence</p>
            <h1>Trustless ticketing for the modern event stack</h1>
            <p className="lead">
              Suiven eliminates fake tickets, fraud, and insecure secondary sales. NFTs sit inside
              participant wallets, resale rules are programmable, and event history mints into POAP prestige
              that unlocks future rewards.
            </p>
            <div className="hero-cta">
              <button className="primary-btn">Book a live demo</button>
              <button className="secondary-btn">Download protocol brief</button>
            </div>
            <div className="hero-stats">
              {landingStats.map((stat) => (
                <div key={stat.label}>
                  <span>{stat.value}</span>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-card">
            <div className="ticket-card">
              <div className="ticket-header">
                <span>Genesis Summit 2025</span>
                <strong>VIP // NFT Ticket</strong>
              </div>
              <div className="ticket-body">
                <div>
                  <p>Owner</p>
                  <h3>0x4a9c...8bfe</h3>
                </div>
                <div>
                  <p>Seat</p>
                  <h3>Row A · 12</h3>
                </div>
                <div>
                  <p>Access Window</p>
                  <h3>09:00 - 11:30</h3>
                </div>
              </div>
              <div className="ticket-footer">
                <p>On-chain proof of attendance auto-mints post scan.</p>
                <div className="chip">Sui · Finality &lt; 2s</div>
              </div>
            </div>
            <div className="ticket-shadow" />
          </div>
        </div>
      </header>

      <section id="features" className="feature-grid">
        {featureCards.map((feature) => (
          <article key={feature.title} className="feature-card">
            <span className="badge">{feature.badge}</span>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </article>
        ))}
      </section>

      <section id="flow" className="flow-section">
        <div>
          <p className="eyebrow">Workflow</p>
          <h2>From mint to memories—fully verifiable</h2>
          <p>
            Every step is composable with your existing stack. Plug in CRM, payment rails, or custom settlement
            logic via the Suiven SDK.
          </p>
        </div>
        <div className="flow-steps">
          {flowSteps.map((step) => (
            <div key={step.label} className="flow-card">
              <span>{step.label}</span>
              <h4>{step.title}</h4>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="trust" className="proof-section">
        {proofPoints.map((point) => (
          <article key={point.title}>
            <h3>{point.title}</h3>
            <ul>
              {point.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="cta-panel">
        <div>
          <p className="eyebrow">Launch on Suiven</p>
          <h2>Put every ticket, resale, and reward on autopilot</h2>
          <p>
            Spin up a private environment, connect your payment flow, and test net-new ticket experiences in
            hours—not months.
          </p>
        </div>
        <div className="cta-actions">
          <button className="primary-btn">Talk to product</button>
          <button className="ghost-btn">Explore docs</button>
        </div>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Suiven Labs · Built on Sui</span>
        <div className="footer-links">
          <a href="#">Security</a>
          <a href="#">Protocol</a>
          <a href="#">Careers</a>
        </div>
      </footer>
    </div>
  )
}

export default Landing
