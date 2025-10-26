export const featureCards = [
  {
    title: 'On-chain authenticity',
    body: 'Tickets are minted as soul-proof NFTs on Sui, making them verifiable, traceable, and immune to duplication.',
    badge: 'NFT Layer',
  },
  {
    title: 'Transparent secondary sales',
    body: 'Attendees can resell or transfer their passes with built-in royalties that automatically route revenue to organizers.',
    badge: 'Marketplace',
  },
  {
    title: 'Proof of attendance',
    body: 'POAP NFTs attest to participation and unlock loyalty, gated drops, and premium community spaces.',
    badge: 'POAP',
  },
]

export const flowSteps = [
  {
    label: '01',
    title: 'Mint & distribute',
    body: 'Organizers create programmable ticket tiers, define resale rules, and airdrop passes to wallets or emails.',
  },
  {
    label: '02',
    title: 'Secure entry',
    body: 'Attendees present their wallet-bound ticket; validators check signatures and event state instantly on Sui.',
  },
  {
    label: '03',
    title: 'After-event rewards',
    body: 'Attendance is notarized via POAP NFTs that feed loyalty dashboards, token-gated perks, and future drops.',
  },
]

export const proofPoints = [
  {
    title: 'Organizer-grade controls',
    bullets: [
      'Dynamic pricing & capacity management',
      'Automated payouts on primary/secondary sales',
      'Real-time fraud analytics with wallet visibility',
    ],
  },
  {
    title: 'Attendee-first experience',
    bullets: [
      'Wallet or email login with MPC custody',
      'Gas abstracted transfers and swaps',
      'Smart reminders plus calendar + wallet sync',
    ],
  },
]

export const landingStats = [
  { label: 'Tickets safeguarded', value: '52K+' },
  { label: 'Resale royalties captured', value: '$1.8M' },
  { label: 'Communities powered', value: '140+' },
]

export const dashboardStats = [
  { label: 'Active campaigns', value: '12', detail: 'Across 4 markets' },
  { label: 'Wallets synced', value: '18.3K', detail: '+12% MoM' },
  { label: 'Resale royalties', value: '$142K', detail: 'Last 30 days' },
]

export const upcomingEvents = [
  { title: 'Sui Builder Summit', meta: 'Apr 12 · Lisbon', status: 'Ticketing live' },
  { title: 'Neon Shore Festival', meta: 'May 03 · Miami', status: 'Onboarding crew' },
  { title: 'Validator Day AMA', meta: 'May 18 · Singapore', status: 'POAP drafting' },
]

export const automationTasks = [
  {
    title: 'Release loyalty drop',
    body: 'Send POAP NFTs to 4,200 verified attendees for Genesis Summit 2025.',
  },
  {
    title: 'Enable instant resale',
    body: 'Activate Sui escrow for Neon Shore GA tier with 8% creator share.',
  },
  {
    title: 'Sync CRM segment',
    body: 'Push VIP wallet list to HubSpot for concierge outreach automations.',
  },
]

export const creationFields = [
  { label: 'Event name', placeholder: 'Sui Builder Summit' },
  { label: 'Location', placeholder: 'Lisbon, Portugal' },
  { label: 'Date & time', placeholder: 'Apr 12 · 18:00 UTC' },
  { label: 'Ticket tiers', placeholder: 'VIP, Pro, Community...' },
]

export const discoverEvents = [
  {
    title: 'Suiverse Hack Week',
    detail: 'Apr 22 · Seoul · Hybrid',
    tiers: 'XP NFTs · 3 passes left',
  },
  {
    title: 'Validator Roundtable',
    detail: 'May 04 · NYC · IRL',
    tiers: 'Invite-only · 128 spots',
  },
  {
    title: 'Neon Shore Festival',
    detail: 'May 03 · Miami · Festival',
    tiers: 'GA / VIP / Creator',
  },
  {
    title: 'Sui DevConnect',
    detail: 'Jun 10 · Online',
    tiers: 'Free · 5 POAP quests',
  },
]

export const walletTickets = [
  { event: 'Genesis Summit', tier: 'VIP', tokenId: '#9841', status: 'Confirmed' },
  { event: 'Neon Shore', tier: 'Backstage', tokenId: '#4410', status: 'Transferable' },
  { event: 'Validator AMA', tier: 'Standard', tokenId: '#7823', status: 'Used' },
]

export const managementRows = [
  {
    name: 'Neon Shore Festival',
    phase: 'Ticketing',
    sold: '4,812 / 5,000',
    revenue: '$812K',
  },
  {
    name: 'Sui Builder Summit',
    phase: 'Waitlist',
    sold: '2,140 / 3,200',
    revenue: '$402K',
  },
  {
    name: 'Validator Day AMA',
    phase: 'Post-event',
    sold: '980 / 980',
    revenue: '$68K',
  },
]
