import type { EventMetadata } from '../utils/sui'

export type SuivenEvent = {
  objectId: string
  initialSharedVersion?: string
  organizer: string
  metadataUri: string
  metadata: EventMetadata
  startTs: number
  endTs: number
  capacity: number
  sold: number
  priceAmount: string
  priceIsSui: boolean
  priceTokenType: string
  royaltyBps: number
  transferable: boolean
  resaleWindowEnd: number
}

export type SuivenTicket = {
  objectId: string
  eventId: string
  owner: string
  metadataUri: string
  metadata: EventMetadata | null
  mintedAt: number
  used: boolean
}
