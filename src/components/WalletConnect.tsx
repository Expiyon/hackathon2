import {
  ConnectModal,
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
} from '@mysten/dapp-kit'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { shortenAddress } from '../utils/format'

function WalletConnect() {
  const currentAccount = useCurrentAccount()
  const { currentWallet } = useCurrentWallet()
  const { mutateAsync: disconnect, isPending } = useDisconnectWallet()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (currentAccount && location.pathname === '/') {
      navigate('/home', { replace: true })
    }
  }, [currentAccount, location.pathname, navigate])

  if (!currentAccount) {
    return (
      <div className="wallet-connect">
        <ConnectModal
          trigger={
            <button className="wallet-btn" type="button">
              Connect Sui wallet
            </button>
          }
        />
        <div className="wallet-details">
          <p className="wallet-hint">Requires a Sui-compatible wallet extension.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="wallet-connect">
      <button
        className="wallet-btn"
        type="button"
        onClick={() => disconnect()}
        disabled={isPending}
      >
        {isPending ? 'Disconnecting...' : shortenAddress(currentAccount.address)}
      </button>
      <div className="wallet-details connected">
        <p>
          Linked via <span>{currentWallet?.name ?? 'Sui Wallet'}</span>
        </p>
        <ConnectModal
          trigger={
            <button className="wallet-link" type="button">
              Switch wallet
            </button>
          }
        />
      </div>
    </div>
  )
}

export default WalletConnect
