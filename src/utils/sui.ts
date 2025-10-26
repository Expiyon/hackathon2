import { fromB64 } from '@mysten/sui/utils'

const utf8Decoder = new TextDecoder()
const MIST_PER_SUI = 1_000_000_000n

export type EventMetadata = {
  title: string
  location?: string
  detail?: string
  tiers?: string
  description?: string
}

export const decodeVectorString = (value?: string | number[] | null) => {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return utf8Decoder.decode(fromB64(value))
  }

  return utf8Decoder.decode(Uint8Array.from(value))
}

export const parseMetadata = (raw: string): EventMetadata => {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      return {
        title: String(parsed.title ?? parsed.name ?? 'Untitled event'),
        location: parsed.location ? String(parsed.location) : undefined,
        detail: parsed.detail ? String(parsed.detail) : undefined,
        tiers: parsed.tiers ? String(parsed.tiers) : undefined,
        description: parsed.description ? String(parsed.description) : undefined,
      }
    }
  } catch {
    // swallow parsing errors and fall back to string form
  }

  return {
    title: raw || 'Untitled event',
  }
}

export const formatMistToSui = (value: string | bigint) => {
  const mist = typeof value === 'bigint' ? value : BigInt(value || '0')
  const whole = mist / MIST_PER_SUI
  const fraction = mist % MIST_PER_SUI
  if (fraction === 0n) {
    return whole.toString()
  }
  const padded = fraction.toString().padStart(9, '0').replace(/0+$/, '')
  return `${whole.toString()}.${padded}`
}

export const suiToMist = (input: string) => {
  if (!input) return 0n
  const trimmed = input.trim()
  if (!trimmed) return 0n
  const [wholePart, fractionalPart = ''] = trimmed.split('.')
  const whole = BigInt(wholePart || '0')
  const fraction = fractionalPart.padEnd(9, '0').slice(0, 9)
  const decimal = BigInt(fraction || '0')
  return whole * MIST_PER_SUI + decimal
}

export const formatTimestamp = (value?: string | number) => {
  if (!value) return ''
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) return ''
  return new Date(numeric).toLocaleString()
}
