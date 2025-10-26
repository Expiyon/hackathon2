import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import type { SuiObjectData, SuiObjectResponse } from '@mysten/sui/client'

import {
  ADMIN_CAP_ID,
  CLOCK_OBJECT_ID,
  EVENT_TYPE,
  ORGANIZER_CAP_ID,
  POAP_TYPE,
  SUIVEN_PACKAGE_ID,
  TICKET_TYPE,
} from '../config/sui'
import type { SuivenEvent, SuivenPOAP, SuivenTicket } from '../types/suiven'
import { decodeVectorString, parseMetadata, suiToMist } from '../utils/sui'

type CreateEventInput = {
  eventName: string
  metadataPayload: string
  startTs: number
  endTs: number
  capacity: number
  priceAmount: bigint
  priceIsSui: boolean
  priceTokenType: string
  royaltyBps: number
  transferable: boolean
  resaleWindowEnd: number
}

const extractContent = (data?: SuiObjectData) => {
  if (!data || !data.content || data.content.dataType !== 'moveObject') return null
  return data.content
}

const parseEventResponse = (response: SuiObjectResponse): SuivenEvent | null => {
  if (!response.data) return null
  const content = extractContent(response.data)
  if (!content || !('type' in content) || content.type !== EVENT_TYPE) {
    return null
  }

  const fields = (content as any).fields as Record<string, any>
  const metadataUri = fields.metadata_uri ?? ''

  return {
    objectId: response.data?.objectId ?? '',
    initialSharedVersion: (response.data?.owner as any)?.Shared?.initial_shared_version,
    organizer: fields.organizer,
    eventName: fields.event_name ?? 'Event Title',
    metadataUri,
    metadata: parseMetadata(metadataUri),
    startTs: Number(fields.start_ts ?? 0),
    endTs: Number(fields.end_ts ?? 0),
    capacity: Number(fields.capacity ?? 0),
    sold: Number(fields.sold ?? 0),
    priceAmount: fields.price_amount ?? '0',
    priceIsSui: Boolean(fields.price_is_sui),
    priceTokenType: fields.price_token_type ?? '',
    royaltyBps: Number(fields.royalty_bps ?? 0),
    transferable: Boolean(fields.transferable),
    resaleWindowEnd: Number(fields.resale_window_end ?? 0),
    balance: fields.balance ? String(fields.balance) : '0',
  }
}

const parseTicketResponse = (response: SuiObjectResponse): SuivenTicket | null => {
  if (!response.data) return null
  const content = extractContent(response.data)
  if (!content || !('type' in content) || content.type !== TICKET_TYPE) {
    return null
  }

  const fields = (content as any).fields as Record<string, any>
  // Tickets still use vector<u8> for metadata_uri, so we need to decode it
  const metadataUri = fields.metadata_uri ? decodeVectorString(fields.metadata_uri) : ''

  return {
    objectId: response.data?.objectId ?? '',
    eventId: fields.event_id ?? '',
    eventName: fields.event_name ?? 'Event Title',
    owner: fields.owner ?? '',
    metadataUri,
    metadata: metadataUri ? parseMetadata(metadataUri) : null,
    mintedAt: Number(fields.minted_at ?? 0),
    used: Boolean(fields.used),
  }
}

const parsePoapResponse = (response: SuiObjectResponse): SuivenPOAP | null => {
  if (!response.data) return null
  const content = extractContent(response.data)
  if (!content || !('type' in content) || content.type !== POAP_TYPE) {
    return null
  }

  const fields = (content as any).fields as Record<string, any>
  // POAPs use vector<u8> for metadata_uri
  const metadataUri = fields.metadata_uri ? decodeVectorString(fields.metadata_uri) : ''

  return {
    objectId: response.data?.objectId ?? '',
    eventId: fields.event_id ?? '',
    eventName: fields.event_name ?? 'Event Title',
    holder: fields.holder ?? '',
    issuedTs: Number(fields.issued_ts ?? 0),
    metadataUri,
    metadata: metadataUri ? parseMetadata(metadataUri) : null,
  }
}

export const useCreateSuivenEvent = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useSignAndExecuteTransaction()

  const createEvent = async (input: CreateEventInput) => {
    if (!ORGANIZER_CAP_ID) {
      throw new Error('Organizer capability object ID is not configured. Set VITE_SUIVEN_ORGANIZER_CAP_ID.')
    }

    const tx = new Transaction()
    tx.moveCall({
      target: `${SUIVEN_PACKAGE_ID}::suiven_events::create_event`,
      arguments: [
        tx.object(ORGANIZER_CAP_ID),
        tx.pure.string(input.eventName),
        tx.pure.string(input.metadataPayload),
        tx.pure.u64(input.startTs),
        tx.pure.u64(input.endTs),
        tx.pure.u64(input.capacity),
        tx.pure.u128(input.priceAmount),
        tx.pure.bool(input.priceIsSui),
        tx.pure.string(input.priceTokenType),
        tx.pure.u16(input.royaltyBps),
        tx.pure.bool(input.transferable),
        tx.pure.u64(input.resaleWindowEnd),
      ],
    })

    const result = await mutateAsync({ transaction: tx })
    await queryClient.invalidateQueries({ queryKey: ['suiven', 'events'] })
    await queryClient.invalidateQueries({ queryKey: ['suiven', 'all-events'] })
    return result
  }

  return { createEvent, isPending }
}

export const usePurchaseTicket = (ownerAddress?: string | null) => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useSignAndExecuteTransaction()

  const purchaseTicket = async (event: SuivenEvent) => {
    if (!event.initialSharedVersion) {
      throw new Error('Event is not shared or missing the initial shared version.')
    }

    const tx = new Transaction()

    // Split coin from gas for payment
    const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(event.priceAmount)])

    tx.moveCall({
      target: `${SUIVEN_PACKAGE_ID}::suiven_tickets::purchase_with_payment`,
      arguments: [
        tx.sharedObjectRef({
          objectId: event.objectId,
          initialSharedVersion: event.initialSharedVersion,
          mutable: true,
        }),
        paymentCoin,
        tx.pure.string(event.metadataUri),
        tx.object(CLOCK_OBJECT_ID),
      ],
    })

    const result = await mutateAsync({ transaction: tx })
    await queryClient.invalidateQueries({ queryKey: ['suiven', 'tickets', ownerAddress ?? ''] })
    await queryClient.invalidateQueries({ queryKey: ['suiven', 'events'] })
    await queryClient.invalidateQueries({ queryKey: ['suiven', 'all-events'] })
    return result
  }

  return { purchaseTicket, isPending }
}

export const useWithdrawEventFunds = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useSignAndExecuteTransaction()

  const withdrawFunds = async (event: SuivenEvent) => {
    if (!ADMIN_CAP_ID) {
      throw new Error('Admin capability object ID is not configured. Set VITE_SUIVEN_ADMIN_CAP_ID.')
    }

    if (!event.initialSharedVersion) {
      throw new Error('Event is not shared or missing the initial shared version.')
    }

    const tx = new Transaction()
    tx.moveCall({
      target: `${SUIVEN_PACKAGE_ID}::suiven_events::admin_withdraw_event_funds`,
      arguments: [
        tx.object(ADMIN_CAP_ID),
        tx.sharedObjectRef({
          objectId: event.objectId,
          initialSharedVersion: event.initialSharedVersion,
          mutable: true,
        }),
      ],
    })

    const result = await mutateAsync({ transaction: tx })
    await queryClient.invalidateQueries({ queryKey: ['suiven', 'events'] })
    await queryClient.invalidateQueries({ queryKey: ['suiven', 'all-events'] })
    await queryClient.invalidateQueries({ queryKey: ['suiven', 'event', event.objectId] })
    return result
  }

  return { withdrawFunds, isPending }
}

export const useWalletTickets = (owner?: string | null) => {
  const client = useSuiClient()

  return useQuery({
    queryKey: ['suiven', 'tickets', owner ?? ''],
    enabled: Boolean(owner),
    queryFn: async () => {
      if (!owner) return [] as SuivenTicket[]

      const response = await client.getOwnedObjects({
        owner,
        filter: { StructType: TICKET_TYPE },
        options: { showContent: true },
        limit: 50,
      })

      return response.data
        .map((item) => parseTicketResponse(item))
        .filter((ticket): ticket is SuivenTicket => Boolean(ticket))
    },
  })
}

export const useWalletPOAPs = (owner?: string | null) => {
  const client = useSuiClient()

  return useQuery({
    queryKey: ['suiven', 'poaps', owner ?? ''],
    enabled: Boolean(owner),
    queryFn: async () => {
      if (!owner) return [] as SuivenPOAP[]

      const response = await client.getOwnedObjects({
        owner,
        filter: { StructType: POAP_TYPE },
        options: { showContent: true },
        limit: 50,
      })

      return response.data
        .map((item) => parsePoapResponse(item))
        .filter((poap): poap is SuivenPOAP => Boolean(poap))
    },
  })
}

export const useEventFormDefaults = () => {
  return useMemo(
    () => ({
      metadataPayload: JSON.stringify(
        {
          title: 'Suiven Showcase',
          location: 'Lisbon, Portugal',
          detail: 'Apr 12 · 18:00 UTC',
          tiers: 'VIP · Pro · Community',
          description: 'Programmable ticket drop powered by Suiven on Sui.',
        },
        null,
        2,
      ),
      startTs: Date.now(),
      endTs: Date.now() + 3 * 60 * 60 * 1000,
      priceAmount: suiToMist('1'),
      royaltyBps: 500,
    }),
    [],
  )
}

export const useEventDetails = (eventId?: string) => {
  const client = useSuiClient()

  return useQuery({
    queryKey: ['suiven', 'event', eventId],
    enabled: Boolean(eventId),
    queryFn: async () => {
      if (!eventId) return null

      const response = await client.getObject({
        id: eventId,
        options: { showContent: true, showOwner: true },
      })

      return parseEventResponse(response)
    },
  })
}

export const useAllEvents = () => {
  const client = useSuiClient()

  return useQuery({
    queryKey: ['suiven', 'all-events'],
    queryFn: async () => {
      // Query EventCreated events from the blockchain
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${SUIVEN_PACKAGE_ID}::suiven_events::EventCreated`
        },
        limit: 50,
        order: 'descending'
      })

      // Extract event IDs from the emitted events
      const eventIds = events.data.map(e => {
        const parsed = e.parsedJson as any
        return parsed.event_id
      })

      if (!eventIds.length) {
        return [] as SuivenEvent[]
      }

      // Fetch the actual event objects
      const responses = await Promise.all(
        eventIds.map(id =>
          client.getObject({
            id,
            options: { showContent: true, showOwner: true }
          })
        )
      )

      return responses
        .map((item) => parseEventResponse(item))
        .filter((event): event is SuivenEvent => Boolean(event))
    },
  })
}

export const useTicketDetails = (ticketId?: string) => {
  const client = useSuiClient()

  return useQuery({
    queryKey: ['suiven', 'ticket', ticketId],
    enabled: Boolean(ticketId),
    queryFn: async () => {
      if (!ticketId) return null

      const response = await client.getObject({
        id: ticketId,
        options: { showContent: true },
      })

      return parseTicketResponse(response)
    },
  })
}

export const useBurnTicketAndMintPOAP = (ownerAddress?: string | null) => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useSignAndExecuteTransaction()

  const burnAndMint = async (ticketId: string, metadataUri: string) => {
    const tx = new Transaction()

    tx.moveCall({
      target: `${SUIVEN_PACKAGE_ID}::suiven_poap::burn_ticket_and_mint_poap_entry`,
      arguments: [
        tx.object(ticketId),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(metadataUri))),
        tx.object(CLOCK_OBJECT_ID),
      ],
    })

    const result = await mutateAsync({ transaction: tx })

    // Invalidate both tickets and poaps queries
    await queryClient.invalidateQueries({ queryKey: ['suiven', 'tickets', ownerAddress ?? ''] })
    await queryClient.invalidateQueries({ queryKey: ['suiven', 'poaps', ownerAddress ?? ''] })

    return result
  }

  return { burnAndMint, isPending }
}
