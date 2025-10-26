import { Suspense, lazy } from 'react'
import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useCurrentAccount } from '@mysten/dapp-kit'
import './App.css'
import WalletConnect from './components/WalletConnect'
import { shortenAddress } from './utils/format'

const LandingPage = lazy(() => import('./pages/Landing'))
const HomeOverview = lazy(() => import('./pages/HomeOverview'))
const EventCreationPage = lazy(() => import('./pages/EventCreationPage'))
const DiscoverEventsPage = lazy(() => import('./pages/DiscoverEventsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const EventManagementPage = lazy(() => import('./pages/EventManagementPage'))

const navItems = [
  { label: 'Overview', to: '/home' },
  { label: 'Create event', to: '/create' },
  { label: 'Discover', to: '/discover' },
  { label: 'Profile', to: '/profile' },
  { label: 'Manage', to: '/manage' },
]

function ConnectedLayout({ accountAddress }: { accountAddress: string }) {
  return (
    <div className="home-screen">
      <nav className="nav home-nav">
        <div className="brand">Suiven</div>
        <div className="home-nav-links">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="home-pill">
          <span>Wallet</span>
          <strong>{shortenAddress(accountAddress)}</strong>
        </div>
        <WalletConnect />
      </nav>
      <Outlet context={{ accountAddress }} />
    </div>
  )
}

function ConnectedLayoutWrapper() {
  const currentAccount = useCurrentAccount()
  if (!currentAccount) {
    return <Navigate to="/" replace />
  }
  return <ConnectedLayout accountAddress={currentAccount.address} />
}

function App() {
  return (
    <Suspense fallback={<div className="loading-state">Yükleniyor…</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<ConnectedLayoutWrapper />}>
          <Route path="/home" element={<HomeOverview />} />
          <Route path="/create" element={<EventCreationPage />} />
          <Route path="/discover" element={<DiscoverEventsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/manage" element={<EventManagementPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
