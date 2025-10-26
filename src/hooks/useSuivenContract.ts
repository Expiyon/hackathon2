import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import type { SuiObjectData, SuiObjectResponse } from '@mysten/sui/client'

import {
  CLOCK_OBJECT_ID,
  EVENT_TYPE,
  FEATURED_EVENT_IDS,
  ORGANIZER_CAP_ID,
  SUIVEN_PACKAGE_ID,
  TICKET_TYPE,
} from '../config/sui'
import type { SuivenEvent, SuivenTicket } from '../types/suiven'
import { decodeVectorString, parseMetadata, suiToMist } from '../utils/sui'

type CreateEventInput = {
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
  const metadataUri = decodeVectorString(fields.metadata_uri)

  return {
    objectId: response.data?.objectId ?? '',
    initialSharedVersion: (response.data?.owner as any)?.Shared?.initial_shared_version,
    organizer: fields.organizer,
    metadataUri,
    metadata: parseMetadata(metadataUri),
    startTs: Number(fields.start_ts ?? 0),
    endTs: Number(fields.end_ts ?? 0),
    capacity: Number(fields.capacity ?? 0),
    sold: Number(fields.sold ?? 0),
    priceAmount: fields.price_amount ?? '0',
    priceIsSui: Boolean(fields.price_is_sui),
    priceTokenType: decodeVectorString(fields.price_token_type),
    royaltyBps: Number(fields.royalty_bps ?? 0),
    transferable: Boolean(fields.transferable),
    resaleWindowEnd: Number(fields.resale_window_end ?? 0),
  }
}

const parseTicketResponse = (response: SuiObjectResponse): SuivenTicket | null => {
  if (!response.data) return null
  const content = extractContent(response.data)
  if (!content || !('type' in content) || content.type !== TICKET_TYPE) {
    return null
  }

  const fields = (content as any).fields as Record<string, any>
  const metadataUri = decodeVectorString(fields.metadata_uri)

  return {
    objectId: response.data?.objectId ?? '',
    eventId: fields.event_id ?? '',
    owner: fields.owner ?? '',
    metadataUri,
    metadata: metadataUri ? parseMetadata(metadataUri) : null,
    mintedAt: Number(fields.minted_at ?? 0),
    used: Boolean(fields.used),
  }
}

export const useFeaturedEvents = () => {
  const client = useSuiClient()

  return useQuery({
    queryKey: ['suiven', 'events', FEATURED_EVENT_IDS],
    queryFn: async () => {
      if (!FEATURED_EVENT_IDS.length) {
        return [] as SuivenEvent[]
      }

      const responses = await Promise.all(
        FEATURED_EVENT_IDS.map((id: string) =>
          client.getObject({
            id,
            options: { showContent: true, showOwner: true },
          }),
        ),
      )

      return responses
        .map((item) => parseEventResponse(item))
        .filter((event): event is SuivenEvent => Boolean(event))
    },
  })
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
    tx.moveCall({
      target: `${SUIVEN_PACKAGE_ID}::suiven_tickets::purchase_with_payment`,
      arguments: [
        tx.sharedObjectRef({
          objectId: event.objectId,
          initialSharedVersion: event.initialSharedVersion,
          mutable: true,
        }),
        tx.pure.u128(event.priceAmount),
        tx.pure.string(event.metadataUri),
        tx.object(CLOCK_OBJECT_ID),
      ],
    })

    const result = await mutateAsync({ transaction: tx })
    await queryClient.invalidateQueries({ queryKey: ['suiven', 'tickets', ownerAddress ?? ''] })
    return result
  }

  return { purchaseTicket, isPending }
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
      // Get all objects of EVENT_TYPE
      const response = await client.getOwnedObjects({
        owner: '0x0000000000000000000000000000000000000000000000000000000000000000', // Shared objects
        filter: { StructType: EVENT_TYPE },
        options: { showContent: true, showOwner: true },
        limit: 50,
      })

      return response.data
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

export const useMarkTicketAsUsed = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useSignAndExecuteTransaction()

  const markAsUsed = async (ticketId: string) => {
    // Note: This would require VerifierCap, which is not implemented in the current contract
    // For now, we'll implement a basic version that doesn't require cap
    const tx = new Transaction()
    // This is a placeholder - actual implementation would need VerifierCap
    tx.moveCall({
      target: `${SUIVEN_PACKAGE_ID}::suiven_tickets::mark_as_used`,
      arguments: [
        tx.object(ticketId),
        // tx.object(VERIFIER_CAP_ID), // Would need this
      ],
    })

    const result = await mutateAsync({ transaction: tx })
    await queryClient.invalidateQueries({ queryKey: ['suiven', 'tickets'] })
    return result
  }

  return { markAsUsed, isPending }
}
