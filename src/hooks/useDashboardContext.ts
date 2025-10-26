import { useOutletContext } from 'react-router-dom'

export type DashboardContext = { accountAddress: string }

export function useDashboardContext() {
  return useOutletContext<DashboardContext>()
}
