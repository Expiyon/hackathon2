import { normalizeSuiAddress } from '@mysten/sui/utils'

const FALLBACK_PACKAGE_ID = '0x5fa8925d545c3a6ba94bf3a1727db38bb762cd3f4a14af2f8c0621db80e299a3'

const normalize = (value?: string) => {
  if (!value) return ''
  try {
    return normalizeSuiAddress(value)
  } catch {
    return value
  }
}

const packageId = normalize(import.meta.env.VITE_SUIVEN_PACKAGE_ID) || FALLBACK_PACKAGE_ID
const organizerCapId = normalize(import.meta.env.VITE_SUIVEN_ORGANIZER_CAP_ID)
const adminCapId = normalize(import.meta.env.VITE_SUIVEN_ADMIN_CAP_ID)
const clockObjectId = normalize(import.meta.env.VITE_SUIVEN_CLOCK_OBJECT_ID) || '0x6'

export const SUIVEN_PACKAGE_ID = packageId
export const ORGANIZER_CAP_ID = organizerCapId
export const ADMIN_CAP_ID = adminCapId
export const CLOCK_OBJECT_ID = clockObjectId

export const EVENT_TYPE = `${SUIVEN_PACKAGE_ID}::suiven_events::Event`
export const TICKET_TYPE = `${SUIVEN_PACKAGE_ID}::suiven_tickets::TicketNFT`
